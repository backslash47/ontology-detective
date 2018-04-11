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

import { SearchParams } from 'elasticsearch';
import { getClient } from './elastic/api';
import { Indices } from './elastic/model';
import { Transaction } from './ont/model';
import { Direction, Result } from '../common/gridTypes';

export type SortColumn = 'TxType' | 'Hash' | 'Timestamp' | 'Result';

export async function getBlockTransactions(
    BlockHash: string, 
    from: number, 
    size: number,
    sortColumn: SortColumn, 
    direction: Direction
): Promise<Result<Transaction>> {
    const client = getClient();

    const params: SearchParams = {
        index: Indices.Tx,
        from,
        size,
        sort: `${sortColumn}:${direction === 'ascending' ? 'asc' : 'desc'}`,
        body: {
            query: {
                bool : {
                    must: {
                        term : { BlockHash }
                    },
                    must_not : {
                        term : { 'TxType' : 0 }
                      },
                }
            }
        }
    };

    const response = await client.search<Transaction>(params);
    const items = response.hits.hits.map(tx => tx._source);

    return {items, count: response.hits.total};
}

export async function getTransactions(
    from: number, 
    size: number,
    sortColumn: SortColumn, 
    direction: Direction
): Promise<Result<Transaction>> {
    const client = getClient();

    const params: SearchParams = {
        index: Indices.Tx,
        from,
        size,
        sort: `${sortColumn}:${direction === 'ascending' ? 'asc' : 'desc'}`,
        body: {
            query: {
                bool : {
                    must_not : {
                        term : { 'TxType' : 0 }
                      },
                }
            }
        }
    };

    const response = await client.search<Transaction>(params);
    const items = response.hits.hits.map(tx => tx._source);

    return { items, count: response.hits.total };
}

export async function getTransaction(hash: string): Promise<Transaction> {
    const client = getClient();

    const response = await client.get<Transaction>({index: Indices.Tx, type: 'default', id: hash});
    return response._source;
}

export async function indexTransaction(transaction: Transaction): Promise<void> {
    const client = getClient();

    await client.index({ index: Indices.Tx, type: 'default', id: transaction.Hash, body: transaction });
}
