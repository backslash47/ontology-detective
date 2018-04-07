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

import { GetBlockByHeightResponse, BlockWrapper } from './model';
import { CONST } from 'ont-sdk-ts';
import fetch from 'node-fetch';

// Implementation code where T is the returned data shape
async function getBlockByHeight(url: string): Promise<BlockWrapper> {
    const response = await fetch(url);
    const result: GetBlockByHeightResponse = await response.json();

    return result.Result;
}

export async function getBlock(index: number): Promise<BlockWrapper> {
    return await getBlockByHeight(`${CONST.TEST_ONT_URL.REST_URL}api/v1/block/details/height/${index}`);
}
