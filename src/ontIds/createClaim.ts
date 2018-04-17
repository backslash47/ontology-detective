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

import { compose, withState, withHandlers, flattenProp, withProps } from 'recompose';
import { get } from 'lodash';
import { RouterProps, match } from 'react-router';
import { withRouter } from 'react-router-dom';
import { StateSetter } from '~/utils';
import { registerSelfClaim } from '~/shared/walletApi';
import View from './createClaimView';

interface PropsOuter {
    match: match<{id: string}>;
}

interface PropsOwn {
    id: string;
}

interface State {
    registering: boolean;
}

interface Handlers {
    handleCreate: (values: object) => void;
    handleValidateNotEmpty: (value: string) => boolean;
    handleValidateJSon: (value: string) => boolean;
}

export interface PropsInner extends Handlers, State, PropsOwn, PropsOuter {
}

export default compose<PropsInner, PropsOuter>(
    withRouter,
    withProps<PropsOwn, PropsOuter>(props => ({
        id: props.match.params.id
    })),
    withState<null, Partial<State>, 'state', 'setState'>('state', 'setState', {
        registering: false
    }),
    withHandlers<PropsOuter & PropsOwn & StateSetter<State> & RouterProps, Handlers>({
        handleCreate: (props) => async (values) => {
            props.setState({
                ...props.state,
                registering: true
            });

            const password = get(values, 'password');
            const context = get(values, 'context');
            const content = get(values, 'content');
            const contentJson = JSON.parse(content);
            
            try {
                await registerSelfClaim(props.id, password, context, contentJson);
                
                props.setState({
                    ...props.state,
                    registering: false
                });

                props.history.push(`/ont-ids/${props.id}`);
                return Promise.resolve({});
            } catch (e) {
                props.setState({
                    ...props.state,
                    registering: false,
                }); 

                return Promise.resolve({ password: 'Invalid password.'});
            }
        },
        handleValidateNotEmpty: (props) => (value) => (value === undefined || value.trim().length === 0),
        handleValidateJSon: (props) => (value) => {
            try {
                JSON.parse(value);
                return false;
            } catch (e) {
                return true;
            }
        }
    }),
    flattenProp('state'),
) (View);
