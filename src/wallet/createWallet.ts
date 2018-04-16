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

import { compose, withState, withHandlers, flattenProp } from 'recompose';
import { RouterProps } from 'react-router';
import { withRouter } from 'react-router-dom';
import { InputOnChangeData } from 'semantic-ui-react';
import { Wallet, scrypt } from 'ont-sdk-ts';
import { StateSetter } from '~/utils';
import { registerIdentity, saveWallet } from '~/shared/walletApi';
import View from './createWalletView';

interface PropsOuter {
}

interface PropsOwn {
}

interface State {
    nameInput: string;
    passwordInput: string;
    registering: boolean;
}

interface Handlers {
    handleCreate: () => void;
    handleNameChange: (e: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => void;
    handlePasswordChange: (e: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => void;
}

export interface PropsInner extends Handlers, State, PropsOwn, PropsOuter {
}

export default compose<PropsInner, PropsOuter>(
    withRouter,
    withState<null, Partial<State>, 'state', 'setState'>('state', 'setState', {
        nameInput: '',
        passwordInput: '',
        registering: false
    }),
    withHandlers<StateSetter<State> & RouterProps, Handlers>({
        handleCreate: (props) => async () => {
            props.setState({
                ...props.state,
                registering: true
            });

            const name = props.state.nameInput;
            const password = props.state.passwordInput;

            const wallet = Wallet.createIdentityWallet(password, name);
            
            const identity = wallet.identities[0];
            const encryptedKey = identity.controls[0].key;
            const privateKey = scrypt.decrypt(encryptedKey, password);
            
            await registerIdentity(identity.ontid, privateKey);

            saveWallet(wallet);
            
            props.setState({
                ...props.state,
                registering: false
            });

            props.history.push('/wallet');
        },
        handleNameChange: ({state, setState}) => (
            e: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData
        ) => {
            setState({...state, nameInput: data.value !== undefined ? data.value : ''});
        },
        handlePasswordChange: ({state, setState}) => (
            e: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData
        ) => {
            setState({...state, passwordInput: data.value !== undefined ? data.value : ''});
        }
    }),
    flattenProp('state'),
) (View);
