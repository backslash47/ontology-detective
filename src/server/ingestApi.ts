/*
 * Copyright (C) 2018 Matus Zamborsky
 * This file is part of The ONT Detective.
 *
 * The ONT Detective is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The ONT Detective is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with The ONT Detective.  If not, see <http://www.gnu.org/licenses/>.
 */

import ReconnectingWebSocket from './ReconnectingWebsocket';
import * as Html5WebSocket from 'html5-websocket';
import { find, get } from 'lodash';
import { initAccountMappings, initTransferMappings, initOntIdMapping, initTxMappings } from '../shared/elastic/api';
import { Account, TxType, Transaction, BlockWrapper, Event, OntId } from '../shared/ont/model';
import { getAccount, indexAccount } from '../shared/accountsApi';
import { indexTransaction, getTransactions } from '../shared/transactionsApi';
import { indexTransfer } from '../shared/transfersApi';
import { indexBlock, getLastBlock } from '../shared/blocksApi';
import { indexOntId, getOntId } from '../shared/ontIdApi';
import { getDdo } from '../shared/ddoApi';

import { Token, utils, core, DDO, CONST, Wallet, scrypt, TransactionBuilder, TxSender, OntidContract, Claim, Metadata, WebSocketClientApi, RestClient } from 'ont-sdk-ts';
import { Assets, OntIdAction, OntIdAttributeOperation, OntIdRegisterOperation } from '../const';
import { sleep } from '../utils';

const { StringReader } = utils;
const { Transfers, Contract } = Token;

async function changeBalance(u160Address: string, assetAddress: string, value: number, transaction: Transaction) {
    let account: Account;
    try {
        const address = core.u160ToAddress(u160Address);

        account = await getAccount(address);
        account.lastTx = transaction.Hash;
        account.lastTime = transaction.Timestamp;
        account.transactionsCount++;

        const assetBalance = find(account.assets, asset => asset.asset === assetAddress);
        if (assetBalance !== undefined) {
            assetBalance.balance += value;
        } else {
            account.assets.push({
                asset: assetAddress,
                balance: value
            });
        }
    } catch (e) {
        account = {
            address: core.u160ToAddress(u160Address),
            u160Address,
            assets: [{
                asset: assetAddress,
                balance: value
            }],
            firstTx: transaction.Hash,
            firstTime: transaction.Timestamp,
            lastTx: transaction.Hash,
            lastTime: transaction.Timestamp,
            transactionsCount: 1
        };
    }

    for (let assetBalance of account.assets) {
        if (assetBalance.balance < 0) {
            //throw new Error('Incorrect transaction.');
            console.log('Wrong balance on ', account.address);
        }
    }

    await indexAccount(account);
}

function setCharAt(str: string, index: number, chr: string) {
    if (index > str.length - 1) {
        return str;
    }

    return str.substr(0, index) + chr + str.substr(index + 1);
}

async function ingestContract(transaction: Transaction): Promise<void> {
    if (transaction.EventsLoaded !== true) {
        // load events only if not loaded yet
        const events = await fetchEvents(transaction.Hash);
        
        // save loaded events
        transaction.Events = events;
        transaction.Result = transaction.Events !== null;
        transaction.EventsLoaded = true;
    }

    if (transaction.Events !== null) {
        for (let i = 0; i < transaction.Events.length; i++) {
            const event = transaction.Events[i];
            
            if (event.CodeHash === Assets.ONT || event.CodeHash === Assets.ONG) {
                await ingestTransfer(transaction, i, event);
            } else if (event.CodeHash === Assets.ONT_ID || event.CodeHash === Assets.ONT_ID2) {
                await ingestOntIdChange(transaction, i, event);
            }
        }
    }
}

async function ingestTransfer(transaction: Transaction, i: number, event: Event) {

    const asset: string = event.CodeHash as string;
    const from: string = event.States[1] as string;
    const to: string = event.States[2] as string;
    const value: number = Number(event.States[3]);

    const transfer = {
        Id: transaction.Hash + '-' + i,
        Asset: asset,
        Value: value,
        From: from !== '0000000000000000000000000000000000000000' ? core.u160ToAddress(from) : undefined,
        To: core.u160ToAddress(to),
        TxHash: transaction.Hash,
        BlockHash: transaction.BlockHash,
        BlockIndex: transaction.BlockIndex,
        Timestamp: transaction.Timestamp
    };

    if (transfer.From !== undefined) {
        await changeBalance(from, asset, -Number(value), transaction);
    }

    await changeBalance(to, asset, Number(value), transaction);
    await indexTransfer(transfer);
}

async function ingestOntIdChange(transaction: Transaction, i: number, event: Event): Promise<void> {

    const params: string[] = event.States[0] as string[];

    const action: OntIdAction = params[0] as OntIdAction;
    const ontId: string = params[2];

    if (action === OntIdAction.Register) {
        const operation: OntIdRegisterOperation = params[1] as OntIdRegisterOperation;

        if (operation === OntIdRegisterOperation.register) {
            console.log('Registering new ontId ', ontId);

            const ontIdObject: OntId = {
                Id: ontId,
                RegistrationTxHash: transaction.Hash,
                RegistrationTimestamp: transaction.Timestamp,
                LastTxHash: transaction.Hash,
                LastTimestamp: transaction.Timestamp,
                Claims: [],
                ClaimsCount: 0
            };

            await indexOntId(ontIdObject);
        }
    } else if (action === OntIdAction.Attribute) {
        const operation: OntIdAttributeOperation = params[1] as OntIdAttributeOperation;

        if (operation === OntIdAttributeOperation.add) {
            console.log('Adding attribute to ontId ', ontId);

            const attribute: string = params[3];

            let ontIdObject = await getOntId(ontId);

            ontIdObject = {
                ...ontIdObject,
                LastTxHash: transaction.Hash,
                LastTimestamp: transaction.Timestamp,
                Claims: [
                    ...ontIdObject.Claims,
                    {
                        TxHash: transaction.Hash,
                        Timestamp: transaction.Timestamp,
                        Attribute: attribute
                    }
                ],
                ClaimsCount: ontIdObject.ClaimsCount + 1
            }

            await indexOntId(ontIdObject);
        }
    }
}

export async function recalculateAccounts(): Promise<void> {
    await initTransferMappings();
    await initAccountMappings();
    await initOntIdMapping();

    const transactions = await getTransactions(0, 10000, 'Timestamp', 'ascending');
    console.log('Found ', transactions.count, ' transactions.');

    for (let i: number = 0; i < transactions.items.length; i++) {
        let transaction = transactions.items[i];
        console.log(i);
        await ingestContract(transaction);
        await indexTransaction(transaction);
    }
}

export async function ingestBlock(block: BlockWrapper): Promise<void> {
    block.Header.Timestamp *= 1000;

    for (let tx of block.Transactions) {
        tx.BlockHash = block.Header.Hash;
        tx.BlockIndex = block.Header.Height;
        tx.Timestamp = block.Header.Timestamp;

        await ingestContract(tx);
        await indexTransaction(tx);
    }

    block.Header.TransactionsCount = block.Transactions.length;
    block.Header.ConsensusData = String(block.Header.ConsensusData);

    await indexBlock(block.Header);
}

interface BlockResponse {
    Action: string;
    Desc: string;
    Error: number;
    Result: BlockWrapper;
}

class EventResponse {
    Action: string;
    Desc: string;
    Error: number;
    Result: Event[] | null;
}

function fixEventResponse(response: EventResponse) {
    if (response.Result != null) {
        for (let result of response.Result) {
            if (Array.isArray(result.CodeHash)) {
                result.CodeHash = utils.ab2hexstring(result.CodeHash);
            }

            if (result.CodeHash === Assets.ONT ||
                result.CodeHash === Assets.ONG) {
                if (Array.isArray(result.States[1])) {
                    result.States[1] = utils.ab2hexstring(result.States[1]);
                }

                if (Array.isArray(result.States[2])) {
                    result.States[2] = utils.ab2hexstring(result.States[2]);
                }
            } else if (result.CodeHash === Assets.ONT_ID || result.CodeHash === Assets.ONT_ID2) {

                for (let state of result.States) {
                    const params: string[] = state as string[];

                    for (let i = 0; i < params.length; i++) {
                        params[i] = utils.hexstr2str(params[i]);
                    }
                }
            }

            if (Array.isArray(result.TxHash)) {
                result.TxHash = utils.ab2hexstring(result.TxHash);
            }
        }
    }
}

async function fetchEvents(txHash: string): Promise<Event[]> {
    const client = new RestClient(CONST.TEST_ONT_URL.REST_URL);
    const data = await client.getSmartCodeEvent(txHash);

    fixEventResponse(data);
    return data.Result;
}

export async function createOntId() {
    const ontId = 'did:ont:THKWoVP247EHUNt8DFH3sj23TWGHvCYwFm';
    const privateKey = 'ccd14ca73dd2043401cd598b249a282aa202b6a7bcdc1c8108c3befb3774acae';
    
    const tx = OntidContract.buildRegisterOntidTx(ontId, privateKey)
    const param = TransactionBuilder.buildTxParam(tx);
    console.log('sending: ', param);
    
    const txSender = new TxSender(CONST.TEST_ONT_URL.SOCKET_URL);
    txSender.sendTxWithSocket(param, (res, socket) => {
        console.log("receiving:", JSON.stringify(res));
    });
}

export async function createOntClaim() {
    const ontId = 'did:ont:THKWoVP247EHUNt8DFH3sj23TWGHvCYwFm';
    const privateKey = 'ccd14ca73dd2043401cd598b249a282aa202b6a7bcdc1c8108c3befb3774acae';

    const context = 'claim:standard0001';
    const claimData = {
        test: 'backslash'
    };
    
    let date = (new Date()).toISOString()
    if(date.indexOf('.') > -1) {
        date = date.substring(0, date.indexOf('.')) + 'Z'
    }
    
    const metadata = new Metadata();
    metadata.CreateTime = date;
    metadata.Issuer = ontId;
    metadata.Subject = ontId;
    
    const claim = new Claim(context, claimData, metadata)
    claim.sign(privateKey);
    
    const type = utils.str2hexstr('Json')
    const value = utils.str2hexstr(JSON.stringify(claim));

    const tx = OntidContract.buildAddAttributeTx(utils.str2hexstr('claim:' + claim.Id), value, type, ontId, privateKey);
    const param = TransactionBuilder.buildTxParam(tx);
    console.log('sending: ', param);
    //send the transaction

    const txSender = new TxSender(CONST.TEST_ONT_URL.SOCKET_URL);
    txSender.sendTxWithSocket(param, (res, socket) => {
        console.log("receiving:", JSON.stringify(res));
    });
}

// function constructHeartBeat(): string {
//     const request = {
//         Action: 'heartbeat',
//         Version: '1.0.0',
//         id: '1',
//         SubscribeJsonBlock: true,
//         SubscribeRawBlock: true,
//         SubscribeEvent: true,
//         SubscribeBlockTxHashs: true
//     };

//     return JSON.stringify(request);
// }

// function constructTest(): string {
//     const request = {
//         Action: 'getsmartcodeeventbyhash',
//         Version: '1.0.0',
//         Hash: '473fdea5859f719814f05b67116252046369236799500bc4b698ff77994707ce'
//     };

//     return JSON.stringify(request);
// }

export async function ingestBlocks(): Promise<void> {
    const socket = CONST.TEST_ONT_URL.SOCKET_URL;
    const ws = new ReconnectingWebSocket(socket, undefined, { constructor: Html5WebSocket });

    let lastBlock = await getLastBlock();
    let last = 186162; // lastBlock ? lastBlock.Height : -1;
    let working: number | null = null;
    //const resp = await fetchEvents('473fdea5859f719814f05b67116252046369236799500bc4b698ff77994707ce');
    //console.log(JSON.stringify(resp));

    const builder = new WebSocketClientApi();
    
    ws.onopen = function open() {
        console.log('Websocket connected. Starting from ', last + 1);
        ws.send(builder.getBlockJson(last + 1));
    };

    ws.onclose = function close(event: {}) {
        console.log('Websocket disconnected.');
    };

    ws.onmessage = async function incoming(event: { data: string }) {
        const response: BlockResponse = JSON.parse(event.data.toString());
        
        if (response.Desc == 'SUCCESS') {
            const block = response.Result;
            working = block.Header.Height;

            console.log('Ingesting block: ', working);
            await ingestBlock(block);

            last = working;
            ws.send(builder.getBlockJson(working + 1));

        } else if (response.Desc === 'UNKNOWN BLOCK') {
            console.log('No new block, waiting 3 seconds.');
            await sleep(3000);
            ws.send(builder.getBlockJson(last + 1));

        } else {
            console.log('Received error:', response);
        }
    };

    ws.onerror = function (event) {
        console.log(event);
    }
}
