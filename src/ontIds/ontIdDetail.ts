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
import { getOntId } from '~/shared/ontIdApi';
import { getDdo } from '~/shared/ddoApi';
import { OntId, Ddo } from '~/shared/ont/model';
import View from './ontIdDetailView';
import { isOwnIdentity } from '~/shared/walletApi';

interface PropsOuter {
    match: match<{id: string}>;
    location: Location;
}

interface PropsOwn {
    id: string;
}

interface State {
    ontId: OntId;
    own: boolean;
    ddo?: Ddo;
    loaded: boolean;
}

export interface PropsInner extends State, PropsOwn, PropsOuter {
}

export default compose<PropsInner, PropsOuter>(
    withProps<PropsOwn, PropsOuter>(props => ({
        id: props.match.params.id
    })),
    withState<null, Partial<State>, 'state', 'setState'>('state', 'setState', {
        loaded: false,
        own: false
    }),
    lifecycle<PropsOwn & StateSetter<State>, null>({
        async componentDidMount() {
            const ontId = await getOntId(this.props.id);
            const own = isOwnIdentity(ontId.Id);
            
            this.props.setState({
                ontId,
                own,
                loaded: true
            });

            // load ddo if possible
            try {
                const ddo = await getDdo(this.props.id, ontId.CodeHash);
                
                this.props.setState({
                    ...this.props.state,
                    ddo
                });
            } catch (e) {
                console.log('Failed to load DDO', e);
            }
        }
    }),
    flattenProp('state')
) (View);
