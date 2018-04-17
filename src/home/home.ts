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

import { compose, withHandlers, withState, flattenProp } from 'recompose';
import { get } from 'lodash';
import { getBlockByIndex, getBlock } from '~/shared/blocksApi';
import { getTransaction } from '~/shared/transactionsApi';
import { getAccount } from '~/shared/accountsApi';
import { StateSetter } from '~/utils';
import View from './homeView';

function isAddress(q: string): boolean {
    return q.length === 34;
}

function isBlockOrTransaction(q: string): boolean {
    return q.length === 64 || q.length === 66;
}

function isBlockIndex(q: string): boolean {
    return !isNaN(Number(q));
}

interface State {
    redirect?: string;
}

interface Handlers {
    handleSearch: (values: object) => void;
}

export interface PropsInner extends State, Handlers {
}

export default compose<PropsInner, {}>(
    withState<null, State, 'state', 'setState'>('state', 'setState', {
    }),
    withHandlers<StateSetter<State>, Handlers>({
        handleSearch: ({state, setState}) => async (values) => { 
            let q = get(values, 'q').trim();

            if (isAddress(q)) {
                try {
                    await getAccount(q);
                    setState({...state, redirect: `/accounts/${q}`});
                } catch (e) {
                    return Promise.resolve({q: 'Invalid address.'});
                }
            } else if (isBlockOrTransaction(q)) {
                if (q.length === 66) {
                    q = q.substring(2);
                }
                try {
                    await getBlock(q);
                    setState({...state, redirect: `/blocks/${q}`});
                } catch (e) {
                    try {
                        await getTransaction(q);
                        setState({...state, redirect: `/transactions/${q}`});
                    } catch (e) {
                        return Promise.resolve({q: 'Invalid block or transaction hash.'});
                    }
                }  
            } else if (isBlockIndex(q)) { 
                try {
                    const block = await getBlockByIndex(Number(q));
                    setState({...state, redirect: `/blocks/${block.Hash}`});
                } catch (e) {
                    return Promise.resolve({q: 'Invalid block index.'});
                }
            } else {
                return Promise.resolve({q: 'Invalid search term.'});
            }

            return Promise.resolve({});
        },
    }),
    flattenProp('state')
)(View);
