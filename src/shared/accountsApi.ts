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
import { Account } from './ont/model';
import { Direction, Result } from '../common/gridTypes';

export type SortColumn = 'address' | 'firstTime' | 'lastTime' | 'transactionsCount' | 'ontBalance' | 'ongBalance';

export async function getAccount(address: string): Promise<Account> {
    const client = getClient();

    const response = await client.get<Account>({index: Indices.Account, type: 'default', id: address});
    return response._source;
}

export async function getAccountsByIds(
    addresses: string[],
    from: number, 
    size: number, 
    sortColumn: SortColumn, 
    direction: Direction
): Promise<Result<Account>> {
    const client = getClient();

    const params: SearchParams = {
        index: Indices.Account,
        from,
        size,
        sort: `${sortColumn}:${direction === 'ascending' ? 'asc' : 'desc'}`,
        body: {
            query: {
                ids : { values: addresses }
            }
        }
    };

    const response = await client.search<Account>(params);
    const items = response.hits.hits.map(account => account._source);

    return { items, count: response.hits.total };
}

export async function getAccounts(
    from: number, 
    size: number, 
    sortColumn: SortColumn, 
    direction: Direction
): Promise<Result<Account>> {
    const client = getClient();

    const params: SearchParams = {
        index: Indices.Account,
        from,
        size,
        sort: `${sortColumn}:${direction === 'ascending' ? 'asc' : 'desc'}`
    };

    const response = await client.search<Account>(params);
    const items = response.hits.hits.map(account => account._source);

    return { items, count: response.hits.total };
}

export async function indexAccount(account: Account): Promise<void> {
    const client = getClient();
    
    await client.index({ index: Indices.Account, type: 'default', id: account.address, body: account });
}
