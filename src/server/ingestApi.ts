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
import { Assets, OntIdAction, OntIdAttributeOperation, OntIdRegisterOperation, restUrl, websocketUrl } from '../const';
import { sleep } from '../utils';

const { StringReader } = utils;
const { Transfers, Contract } = Token;

async function changeBalance(address: string, assetAddress: string, value: number, transaction: Transaction) {
    let account: Account;

    const ontBalance = assetAddress === Assets.ONT ? value : 0;
    const ongBalance = assetAddress === Assets.ONG ? value : 0;

    try {
        account = await getAccount(address);
        account.lastTx = transaction.Hash;
        account.lastTime = transaction.Timestamp;
        account.transactionsCount++;
        account.ontBalance += ontBalance;
        account.ongBalance += ongBalance;

    } catch (e) {
        account = {
            address,
            firstTx: transaction.Hash,
            firstTime: transaction.Timestamp,
            lastTx: transaction.Hash,
            lastTime: transaction.Timestamp,
            transactionsCount: 1,
            ontBalance,
            ongBalance
        };
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
            console.log('event', event);
            
            if (event.ContractAddress === Assets.ONT || event.ContractAddress === Assets.ONG) {
                await ingestTransfer(transaction, i, event);
            } else if (event.ContractAddress === Assets.ONT_ID) {
                await ingestOntIdChange(transaction, i, event);
            }
        }
    }
}

async function ingestTransfer(transaction: Transaction, i: number, event: Event) {

    const asset: string = event.ContractAddress as string;
    const from: string = event.States[1] as string;
    const to: string = event.States[2] as string;
    const value: number = Number(event.States[3]);

    const transfer = {
        Id: transaction.Hash + '-' + i,
        Asset: asset,
        Value: value,
        From: from !== '0000000000000000000000000000000000000000' ? from : undefined,
        To: to,
        TxHash: transaction.Hash,
        BlockHash: transaction.BlockHash,
        BlockIndex: transaction.BlockIndex,
        Timestamp: transaction.Timestamp
    };

    console.log('Transfer from', from, 'to', to);

    if (transfer.From !== undefined) {
        await changeBalance(from, asset, -Number(value), transaction);
    }

    await changeBalance(to, asset, Number(value), transaction);
    await indexTransfer(transfer);
}

async function ingestOntIdChange(transaction: Transaction, i: number, event: Event): Promise<void> {

    const action: OntIdAction = event.States[0] as OntIdAction;
    const ontId: string = event.States[2] as string;

    if (action === OntIdAction.Register) {
        const operation: OntIdRegisterOperation = event.States[1] as OntIdRegisterOperation;

        if (operation === OntIdRegisterOperation.register) {
            console.log('Registering new ontId ', ontId);

            const ontIdObject: OntId = {
                Id: ontId,
                RegistrationTxHash: transaction.Hash,
                RegistrationTimestamp: transaction.Timestamp,
                LastTxHash: transaction.Hash,
                LastTimestamp: transaction.Timestamp,
                Claims: [],
                ClaimsCount: 0,
                CodeHash: event.ContractAddress.toString()
            };

            await indexOntId(ontIdObject);
        }
    } else if (action === OntIdAction.Attribute) {
        const operation: OntIdAttributeOperation = event.States[1] as OntIdAttributeOperation;

        if (operation === OntIdAttributeOperation.add) {
            console.log('Adding attribute to ontId ', ontId);

            const attribute: string = event.States[3] as string;

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
            if (Array.isArray(result.ContractAddress)) {
                result.ContractAddress = utils.ab2hexstring(result.ContractAddress);
            }

            if (result.ContractAddress === Assets.ONT ||
                result.ContractAddress === Assets.ONG) {
                if (Array.isArray(result.States[1])) {
                    result.States[1] = utils.ab2hexstring(result.States[1]);
                }

                if (Array.isArray(result.States[2])) {
                    result.States[2] = utils.ab2hexstring(result.States[2]);
                }
            } else if (result.ContractAddress === Assets.ONT_ID) {

                for (let i = 0; i < result.States.length; i++) {    
                    result.States[i] = utils.hexstr2str(result.States[i] as string);
                }
            }

            if (Array.isArray(result.TxHash)) {
                result.TxHash = utils.ab2hexstring(result.TxHash);
            }
        }
    }
}

async function fetchEvents(txHash: string): Promise<Event[]> {
    const client = new RestClient(restUrl);
    const data = await client.getSmartCodeEvent(txHash);

    fixEventResponse(data);
    return data.Result;
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
    const socket = websocketUrl;
    const ws = new ReconnectingWebSocket(socket, undefined, { constructor: Html5WebSocket });

    let lastBlock = await getLastBlock();
    let last = 32343; //lastBlock ? lastBlock.Height : -1; // 186162; 
    let working: number | null = null;
    
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
