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
import { sendEmailClaimRequest } from '~/shared/emailClaimApi';
import View from './requestEmailClaimView';

interface PropsOuter {
    match: match<{id: string}>;
}

interface PropsOwn {
    id: string;
}

interface State {
    requesting: boolean;
}

interface Handlers {
    handleRequest: (values: object) => void;
    handleValidateNotEmpty: (value: string) => boolean;
}

export interface PropsInner extends Handlers, State, PropsOwn, PropsOuter {
}

export default compose<PropsInner, PropsOuter>(
    withRouter,
    withProps<PropsOwn, PropsOuter>(props => ({
        id: props.match.params.id
    })),
    withState<null, Partial<State>, 'state', 'setState'>('state', 'setState', {
        requesting: false
    }),
    withHandlers<PropsOuter & PropsOwn & StateSetter<State> & RouterProps, Handlers>({
        handleRequest: (props) => async (values) => {
            props.setState({
                ...props.state,
                requesting: true
            });

            const password = get(values, 'password');
            const email = get(values, 'email');
            
            try {
                await sendEmailClaimRequest(props.id, password, email);
                
                props.setState({
                    ...props.state,
                    requesting: false
                });

                props.history.push(`/ont-ids/${props.id}`);
                return Promise.resolve({});
            } catch (e) {
                props.setState({
                    ...props.state,
                    requesting: false,
                }); 

                return Promise.resolve({ password: 'Invalid password.'});
            }
        },
        handleValidateNotEmpty: (props) => (value) => (value === undefined || value.trim().length === 0),
    }),
    flattenProp('state'),
) (View);
