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

import { compose, lifecycle, branch, renderNothing, withProps, withState, flattenProp } from 'recompose';
import { match } from 'react-router';
import { StateSetter } from '~/utils';
import { Transfer } from '~/shared/ont/model';
import { getTransfer } from '~/shared/transfersApi';
import View from './transferDetailView';

interface PropsOuter {
    match: match<{id: string}>;
}

interface PropsOwn {
    id: string;
}

interface State {
    transfer: Transfer;
    loaded: boolean;
}

export interface PropsInner extends State {
}

export default compose<PropsInner, PropsOuter>(
    withProps<PropsOwn, PropsOuter>(props => ({
        id: props.match.params.id
    })),
    withState<null, Partial<State>, 'state', 'setState'>('state', 'setState', {
        loaded: false
    }),
    lifecycle<PropsOwn & StateSetter<State>, null>({
        async componentDidMount() {
            const transfer = await getTransfer(this.props.id);
            
            this.props.setState({
                transfer,
                loaded: true
            });
        }
    }),
    flattenProp('state'),
    branch<State>(
        ({loaded}) => !loaded,
        renderNothing
    )
) (View);
