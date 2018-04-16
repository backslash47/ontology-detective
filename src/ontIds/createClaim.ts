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
import { RouterProps, match } from 'react-router';
import { withRouter } from 'react-router-dom';
import { InputOnChangeData, TextAreaProps } from 'semantic-ui-react';
import { StateSetter } from '~/utils';
import { registerSelfClaim, Errors } from '~/shared/walletApi';
import View from './createClaimView';

interface PropsOuter {
    match: match<{id: string}>;
}

interface PropsOwn {
    id: string;
}

interface State {
    passwordInput: string;
    contextInput: string;
    contentInput: string;
    registering: boolean;
    wrong: string | null;
}

interface Handlers {
    handleCreate: () => void;
    handlePasswordChange: (e: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => void;
    handleContextChange: (e: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => void;
    handleContentChange: (e: React.SyntheticEvent<HTMLTextAreaElement>, data: TextAreaProps) => void;
}

export interface PropsInner extends Handlers, State, PropsOwn, PropsOuter {
}

export default compose<PropsInner, PropsOuter>(
    withRouter,
    withProps<PropsOwn, PropsOuter>(props => ({
        id: props.match.params.id
    })),
    withState<null, Partial<State>, 'state', 'setState'>('state', 'setState', {
        passwordInput: '',
        contextInput: '',
        contentInput: '',
        registering: false,
        wrong: null
    }),
    withHandlers<PropsOuter & PropsOwn & StateSetter<State> & RouterProps, Handlers>({
        handleCreate: (props) => async () => {
            props.setState({
                ...props.state,
                registering: true,
                wrong: null
            });

            const password = props.state.passwordInput;
            const context = props.state.contextInput;
            const content = props.state.contentInput;

            if (password.trim().length === 0) {
                props.setState({
                    ...props.state,
                    registering: false,
                    wrong: 'Empty password.'
                }); 

                return;
            }

            if (context.trim().length === 0) {
                props.setState({
                    ...props.state,
                    registering: false,
                    wrong: 'Invalid context.'
                }); 

                return;
            }

            let contentJson;
            try {
                contentJson = JSON.parse(content);
            } catch (e) {
                props.setState({
                    ...props.state,
                    registering: false,
                    wrong: 'Invalid JSON content.'
                }); 

                return;
            }

            try {
                await registerSelfClaim(props.id, password, context, contentJson);
                
                props.setState({
                    ...props.state,
                    registering: false
                });

                props.history.push(`/ont-ids/${props.id}`);
            } catch (e) {
                if (e === Errors.WRONG_PASSWORD) {
                    props.setState({
                        ...props.state,
                        registering: false,
                        wrong: 'Invalid password.'
                    }); 
                }
            }
        },
        handlePasswordChange: ({state, setState}) => (
            e: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData
        ) => {
            setState({...state, passwordInput: data.value !== undefined ? data.value : ''});
        },
        handleContextChange: ({state, setState}) => (
            e: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData
        ) => {
            setState({...state, contextInput: data.value !== undefined ? data.value : ''});
        },
        handleContentChange: ({state, setState}) => (
            e: React.SyntheticEvent<HTMLTextAreaElement>, data: TextAreaProps
        ) => {
            setState({...state, contentInput: data.value !== undefined ? data.value.toString() : ''});
        }
    }),
    flattenProp('state'),
) (View);
