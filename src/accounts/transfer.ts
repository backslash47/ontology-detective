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

import { compose, withHandlers, flattenProp, withProps, withState } from 'recompose';
import { get } from 'lodash';
import { RouterProps, match } from 'react-router';
import { withRouter } from 'react-router-dom';
import { timeout, TimeoutError } from 'promise-timeout';
import { transferAsset } from '~/shared/walletApi';
import View from './transferView';
import { StateSetter } from '~/utils';

interface PropsOuter {
    match: match<{id: string}>;
}

interface PropsOwn {
    id: string;
}

interface State {
    sending: boolean;
}

interface Handlers {
    handleSend: (values: object) => void;
    handleValidateNotEmpty: (value: string) => boolean;
    handleValidateAddress: (value: string) => boolean;
}

export interface PropsInner extends Handlers, State, PropsOwn, PropsOuter {
}

export default compose<PropsInner, PropsOuter>(
    withRouter,
    withProps<PropsOwn, PropsOuter>(props => ({
        id: props.match.params.id
    })),
    withState<null, Partial<State>, 'state', 'setState'>('state', 'setState', {
        sending: false
    }),
    withHandlers<RouterProps & PropsOwn & StateSetter<State>, Handlers>({
        handleSend: (props) => async (values) => {
            props.setState({
                ...props.state,
                sending: true
            });
           
            const destination = get(values, 'destination', '');
            const amount = get(values, 'amount', '0');
            const password = get(values, 'password', '');

            try {
                await timeout(transferAsset(props.id, destination, password, amount), 15000);
                props.setState({
                    ...props.state,
                    sending: false
                });

                props.history.push(`/accounts/${props.id}`);
                return Promise.resolve({});
            } catch (e) {
                props.setState({
                    ...props.state,
                    sending: false,
                }); 

                if (e instanceof TimeoutError) {
                    return Promise.resolve({ FORM_ERROR: 'Failed to transfer.'});
                } else {
                    return Promise.resolve({ password: 'Invalid password.'});
                }
            }
        },
        handleValidateNotEmpty: (props) => (value) => (value === undefined || value.trim().length === 0),
        handleValidateAddress: (props) => (value) => (value === undefined || value.trim().length !== 34)
    }),
    flattenProp('state'),
) (View);
