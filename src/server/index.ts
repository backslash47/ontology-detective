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

import { login as loginElastic, initMappings, initTxMappings } from '../shared/elastic/api';
import { ingestBlocks, recalculateAccounts } from './ingestApi';
import { getTransaction } from '../shared/transactionsApi';
import { Token, utils } from 'ont-sdk-ts';
import * as AWS from 'aws-sdk';

require('dotenv').load();

const { StringReader } = utils;
const { Transfers, Contract } = Token; 

function login() {
  const useAws = process.env.REACT_APP_API_AWS !== undefined ? 
    JSON.parse(process.env.REACT_APP_API_AWS) : false;

  if (useAws) {
    AWS.config.region = process.env.REACT_APP_API_AWS_REGION || 'eu-central-1';
  }

  loginElastic(process.env.REACT_APP_API_URL || 'http://localhost:9200', useAws);
}

export async function mappings() {
  login();

  await initMappings();
}

export async function ingest() {
  login();
  
  await ingestBlocks();
}

export async function recalculate() {
  login();

  await recalculateAccounts();
}

export async function fixTxMapping() {
  login();
  
  await initTxMappings(true);
}

import 'make-runnable';
