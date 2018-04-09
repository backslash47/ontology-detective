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
import { find } from 'lodash';
import { initAccountMappings, initTransferMappings } from '../shared/elastic/api';
import { Account, TxType, Transaction, BlockWrapper } from '../shared/ont/model';
import { getAccount, indexAccount } from '../shared/accountsApi';
import { indexTransaction, getTransactions } from '../shared/transactionsApi';
import { indexTransfer } from '../shared/transfersApi';
import { indexBlock, getLastBlock } from '../shared/blocksApi';

import { Token, utils, core, CONST } from 'ont-sdk-ts';
import { Assets } from '../const';
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
            throw new Error('Incorrect transaction.');
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

async function ingestTransfer(transaction: Transaction): Promise<void> {

    if (transaction.TxType === TxType.Invoke) {
        if (transaction.Payload.VmType === 0xFF) {
            try {
                const contract = Contract.deserialize(new StringReader(transaction.Payload.Code));

                if (contract.method === 'transfer') {
                    const transfersOnt = Transfers.deserialize(new StringReader(contract.args));

                    for (let i = 0; i < transfersOnt.states.length; i++) {
                        const state = transfersOnt.states[i];

                        const transfer = {
                            Id: transaction.Hash + '-' + i,
                            Asset: contract.address,
                            Value: Number(state.value),
                            From: core.u160ToAddress(state.from),
                            To: core.u160ToAddress(state.to),
                            TxHash: transaction.Hash,
                            BlockHash: transaction.BlockHash,
                            BlockIndex: transaction.BlockIndex,
                            Timestamp: transaction.Timestamp,
                            Result: true
                        };

                        try {
                            await changeBalance(state.from, contract.address, -Number(state.value), transaction);
                            await changeBalance(state.to, contract.address, Number(state.value), transaction);
                        } catch (e) {
                            console.log('Failed to process transfer', transaction.Hash);
                            transfer.Result = false;
                        }

                        await indexTransfer(transfer);
                    }
                } else if (contract.method === 'init') {
                    if (contract.address === Assets.ONT) {
                        const bookKeepers = [
                            '1202021401156f187ec23ce631a489c3fa17f292171009c6c3162ef642406d3d09c74d',
                            '1202021c6750d2c5d99813997438cee0740b04a73e42664c444e778e001196eed96c9d',
                            '12020339541a43af2206358714cf6bd385fc9ac8b5df554fec5497d9e947d583f985fc',
                            '120203bdf0d966f98ff4af5c563c4a3e2fe499d98542115e1ffd75fbca44b12c56a591'
                        ];
                        const totalSupply = 1000000000;
                        const perBookKeeperSupply = totalSupply / bookKeepers.length;

                        for (let i = 0; i < bookKeepers.length; i++) {
                            const bookKeeperPubKey = bookKeepers[i];

                            let address = core.getHash(bookKeeperPubKey);
                            address = setCharAt(address, 0, '0');
                            address = setCharAt(address, 1, '1');

                            const transfer = {
                                Id: transaction.Hash + '-' + i,
                                Asset: contract.address,
                                Value: perBookKeeperSupply,
                                To: core.u160ToAddress(address),
                                TxHash: transaction.Hash,
                                BlockHash: transaction.BlockHash,
                                BlockIndex: transaction.BlockIndex,
                                Timestamp: transaction.Timestamp,
                                Result: true
                            };

                            await changeBalance(address, contract.address, perBookKeeperSupply, transaction);
                            await indexTransfer(transfer);
                        }
                    } else if (contract.address === Assets.ONG) {
                        const totalSupply = 1000000000 * Math.pow(10, 9);
                        await changeBalance(Assets.ONT, contract.address, totalSupply, transaction);
                    }
                }
            } catch (e) {
                console.log('Failed to process transaction', transaction.Hash);
            }
        }
    }
}

export async function recalculateAccounts(): Promise<void> {
    await initTransferMappings();
    await initAccountMappings();

    const transactions = await getTransactions(0, 100000, 'Timestamp', 'ascending');
    console.log('Found ', transactions.count, ' transactions.');

    for (let transaction of transactions.items) {
        await ingestTransfer(transaction);
    }
}

export async function ingestBlock(block: BlockWrapper): Promise<void> {
    block.Header.Timestamp *= 1000;

    for (let tx of block.Transactions) {
        tx.BlockHash = block.Header.Hash;
        tx.BlockIndex = block.Header.Height;
        tx.Timestamp = block.Header.Timestamp;

        await ingestTransfer(tx);
        await indexTransaction(tx);
    }

    block.Header.TransactionsCount = block.Transactions.length;
    block.Header.ConsensusData = String(block.Header.ConsensusData);

    await indexBlock(block.Header);
}

function constructRequest(index: number): string {
    const request = {
        Action: 'getblockbyheight',
        Version: '1.0.0',
        Height: index
    };

    return JSON.stringify(request);
}

// function constructHeartBeat(): string {
//     const request = {
//         Action: 'heartbeat',
//         Version: '1.0.0',
//         SubscribeJsonBlock: true,
//         SubscribeRawBlock: true,
//         SubscribeEvent: true,
//         SubscribeBlockTxHashs: true
//     };

//     return JSON.stringify(request);
// }

interface WsResponse {
    Action: string;
    Desc: string;
    Error: number;
    Result: BlockWrapper;
}

export async function ingestBlocks(): Promise<void> {
    const socket = CONST.TEST_ONT_URL.SOCKET_URL;
    const ws = new ReconnectingWebSocket(socket, undefined, {constructor: Html5WebSocket});
    
    let lastBlock = await getLastBlock();
    let last = lastBlock ? lastBlock.Height : -1;
    let working: number | null = null;

    ws.onopen = function open() {
        console.log('Websocket connected. Starting from ', last + 1);
        // ws.send(constructHeartBeat());
        ws.send(constructRequest(last + 1));
    };

    ws.onclose = function close(event: {}) {
        console.log('Websocket disconnected.');
    };

    ws.onmessage = async function incoming(event: { data: string }) {
        const response: WsResponse = JSON.parse(event.data.toString());
        
        if (response.Desc === 'SUCCESS') {
            const block = response.Result;
            working = block.Header.Height;
            
            console.log('Ingesting block: ', working);
            await ingestBlock(block);
            
            last = working;
            ws.send(constructRequest(working + 1));
            
        } else if (response.Desc === 'UNKNOWN BLOCK') {
            console.log('No new block, waiting 3 seconds.');
            await sleep(3000);
            ws.send(constructRequest(last + 1));

        } else {
            console.log('Received error:', response);
        }
    };

    ws.onerror = function(event) {
        console.log(event);
    }
}
