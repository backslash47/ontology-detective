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

import { SearchParams, CountParams } from 'elasticsearch';
import { Block } from './ont/model';
import { getClient } from './elastic/api';
import { Indices } from './elastic/model';
import { Direction, Result } from '../common/gridTypes';

export type SortColumn = 'Height' | 'Hash' | 'TransactionsCount' | 'Timestamp';

export async function getBlocks(
    from: number, 
    size: number, 
    sortColumn: SortColumn, 
    direction: Direction
): Promise<Result<Block>> {

    const client = getClient();

    const params: SearchParams = {
        index: Indices.Block,
        from,
        size,
        sort: `${sortColumn}:${direction === 'ascending' ? 'asc' : 'desc'}`
    };

    const response = await client.search<Block>(params);
    const items = response.hits.hits.map(block => block._source);

    return {items, count: response.hits.total};
}

export async function getLastBlock(): Promise<Block|null> {
    const client = getClient();

    const params: SearchParams = {
        index: Indices.Block,
        size: 1,
        sort: 'Height:desc'
    };

    const response = await client.search<Block>(params);
    const blocks = response.hits.hits.map(block => block._source);

    if (blocks.length > 0) {
        return blocks[0];
    } else {
        return null;
    }
}

export async function getBlockByIndex(index: Number): Promise<Block> {
    const client = getClient();

    const params: SearchParams = {
        index: Indices.Block,
        body: {
            query: {
                term : { Height: index }
            }
        }
    };

    const response = await client.search<Block>(params);
    const blocks = response.hits.hits.map(block => block._source);

    if (blocks.length > 0) {
        return blocks[0];
    } else {
        throw new Error('Block not found');
    }
}

export async function getBlock(hash: string): Promise<Block> {
    const client = getClient();

    const response = await client.get<Block>({index: Indices.Block, type: 'default', id: hash});
    return response._source;
}

export async function getBlockCount(): Promise<number> {
    const client = getClient();

    const params: CountParams = {
        index: Indices.Block
    };

    const response = await client.count(params);
    
    return response.count;
}

export async function indexBlock(block: Block): Promise<void> {
    const client = getClient();

    await client.index({ index: Indices.Block, type: 'default', id: block.Hash, body: block });
}
