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

import * as elasticsearch from 'elasticsearch';
import * as HttpAmazonESConnector from 'http-aws-es';

import { txMapping, Indices, blockMapping, accountMapping, TransferMapping, OntIdMapping } from './model';

let hostSaved: string;
let useAwsSaved: boolean = false;

export function login(host: string, useAws?: boolean): void {
    hostSaved = host;
    useAwsSaved = useAws ? true : false;
}

export function getClient(): elasticsearch.Client {
    return new elasticsearch.Client({
        host: `${hostSaved}`,
        log: 'warning',
        connectionClass: useAwsSaved ? HttpAmazonESConnector : undefined
    });
}

export async function getInfo(): Promise<void> {
    const client = getClient();

    const result = await client.info({ requestTimeout: 2000 });
    console.log(result);
}

export async function initTxMappings(keepIndex?: boolean): Promise<void> {
    const client = getClient();

    if (!keepIndex) {
        if (await client.indices.exists({ index: Indices.Tx })) {
            await client.indices.delete({ index: Indices.Tx });
        }

        await client.indices.create({ index: Indices.Tx });
    }

    await client.indices.putMapping({ index: Indices.Tx, type: 'default', body: txMapping });
}

export async function initTransferMappings(): Promise<void> {
    const client = getClient();

    if (await client.indices.exists({ index: Indices.Transfer })) {
        await client.indices.delete({ index: Indices.Transfer });
    }

    await client.indices.create({ index: Indices.Transfer });
    await client.indices.putMapping({ index: Indices.Transfer, type: 'default', body: TransferMapping });
}

export async function initAccountMappings(): Promise<void> {
    const client = getClient();

    if (await client.indices.exists({ index: Indices.Account })) {
        await client.indices.delete({ index: Indices.Account });
    }

    await client.indices.create({ index: Indices.Account });
    await client.indices.putMapping({ index: Indices.Account, type: 'default', body: accountMapping });
}

async function initBlockMappings(): Promise<void> {
    const client = getClient();

    if (await client.indices.exists({ index: Indices.Block })) {
        await client.indices.delete({ index: Indices.Block });
    }

    await client.indices.create({ index: Indices.Block });
    await client.indices.putMapping({ index: Indices.Block, type: 'default', body: blockMapping });
}

export async function initOntIdMapping(): Promise<void> {
    const client = getClient();

    if (await client.indices.exists({ index: Indices.OntId })) {
        await client.indices.delete({ index: Indices.OntId });
    }

    await client.indices.create({ index: Indices.OntId });
    await client.indices.putMapping({ index: Indices.OntId, type: 'default', body: OntIdMapping });
}

export async function initMappings(): Promise<void> {
    await initTxMappings();
    await initBlockMappings();
    await initAccountMappings();
    await initTransferMappings();
    await initOntIdMapping();
}
