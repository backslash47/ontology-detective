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
import { Transfer } from './ont/model';
import { Direction, Result } from '../common/gridTypes';

export type SortColumn = 'Id' | 'TxHash' | 'BlockHash' | 'BlockIndex' | 
    'From' | 'To' | 'Timestamp' | 'Value' | 'Asset';

export async function getBlockTransfers(
    BlockHash: string, 
    from: number, 
    size: number,
    sortColumn: SortColumn, 
    direction: Direction
): Promise<Result<Transfer>> {
    const client = getClient();

    const params: SearchParams = {
        index: Indices.Transfer,
        from,
        size,
        sort: `${sortColumn}:${direction === 'ascending' ? 'asc' : 'desc'}`,
        body: {
            query: {
                term : { BlockHash }
            }
        }
    };

    const response = await client.search<Transfer>(params);
    const items = response.hits.hits.map(transfer => transfer._source);

    return {items, count: response.hits.total};
}

export async function getTransactionTransfers(
    TxHash: string, 
    from: number, 
    size: number,
    sortColumn: SortColumn, 
    direction: Direction
): Promise<Result<Transfer>> {
    const client = getClient();

    const params: SearchParams = {
        index: Indices.Transfer,
        from,
        size,
        sort: `${sortColumn}:${direction === 'ascending' ? 'asc' : 'desc'}`,
        body: {
            query: {
                term : { TxHash }
            }
        }
    };

    const response = await client.search<Transfer>(params);
    const items = response.hits.hits.map(transfer => transfer._source);

    return {items, count: response.hits.total};
}

export async function getAccountTransfers(
    Address: string, 
    from: number, 
    size: number,
    sortColumn: SortColumn, 
    direction: Direction
): Promise<Result<Transfer>> {
    const client = getClient();

    const params: SearchParams = {
        index: Indices.Transfer,
        from,
        size,
        sort: `${sortColumn}:${direction === 'ascending' ? 'asc' : 'desc'}`,
        body: {
            query: {
                bool : {
                    should: [
                        { term : { 'From' : Address } },
                        { term : { 'To' : Address } }
                    ],
                }
            }
        }
    };

    const response = await client.search<Transfer>(params);
    const items = response.hits.hits.map(transfer => transfer._source);

    return {items, count: response.hits.total};
}

export async function getTransfers(
    from: number, 
    size: number,
    sortColumn: SortColumn, 
    direction: Direction
): Promise<Result<Transfer>> {
    const client = getClient();

    const params: SearchParams = {
        index: Indices.Transfer,
        from,
        size,
        sort: `${sortColumn}:${direction === 'ascending' ? 'asc' : 'desc'}`
    };

    const response = await client.search<Transfer>(params);
    const items = response.hits.hits.map(transfer => transfer._source);

    return { items, count: response.hits.total };
}

export async function getTransfer(id: string): Promise<Transfer> {
    const client = getClient();

    const response = await client.get<Transfer>({index: Indices.Transfer, type: 'default', id});
    return response._source;
}

export async function indexTransfer(transfer: Transfer): Promise<void> {
    const client = getClient();

    await client.index({ index: Indices.Transfer, type: 'default', id: transfer.Id, body: transfer });
}
