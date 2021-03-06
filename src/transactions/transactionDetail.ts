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

import { compose, lifecycle, withProps, withState, flattenProp } from 'recompose';
import { match } from 'react-router';
import { Location } from 'history';
import { StateSetter } from '~/utils';
import { Transaction } from '~/shared/ont/model';
import { getTransaction } from '~/shared/transactionsApi';
import View from './transactionDetailView';

interface PropsOuter {
    match: match<{id: string}>;
    location: Location;
}

interface PropsOwn {
    txId: string;
}

interface State {
    transaction: Transaction;
    loaded: boolean;
}

export interface PropsInner extends State, PropsOwn, PropsOuter {
}

export default compose<PropsInner, PropsOuter>(
    withProps<PropsOwn, PropsOuter>(props => ({
        txId: props.match.params.id
    })),
    withState<null, Partial<State>, 'state', 'setState'>('state', 'setState', {
        loaded: false
    }),
    lifecycle<PropsOwn & StateSetter<State>, null>({
        async componentDidMount() {
            const transaction = await getTransaction(this.props.txId);
            
            this.props.setState({
                transaction,
                loaded: true
            });
        }
    }),
    flattenProp('state')
) (View);
