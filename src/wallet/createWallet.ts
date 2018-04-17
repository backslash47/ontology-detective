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
import { get } from 'lodash';
import { RouterProps } from 'react-router';
import { withRouter } from 'react-router-dom';
import { Wallet, scrypt } from 'ont-sdk-ts';
import { StateSetter } from '~/utils';
import { registerIdentity, saveWallet } from '~/shared/walletApi';
import View from './createWalletView';

interface PropsOuter {
}

interface PropsOwn {
    initialValues: object;
}

interface State {
    registering: boolean;
}

interface Handlers {
    handleCreate: (values: object) => void;
    handleValidateNotEmpty: (value: string) => boolean;
}

export interface PropsInner extends Handlers, State, PropsOwn, PropsOuter {
}

export default compose<PropsInner, PropsOuter>(
    withRouter,
    withState<null, Partial<State>, 'state', 'setState'>('state', 'setState', {
        registering: false
    }),
    withHandlers<StateSetter<State> & RouterProps, Handlers>({
        handleCreate: (props) => async (values) => {
            props.setState({
                ...props.state,
                registering: true
            });

            const name = get(values, 'name', '');
            const password = get(values, 'password', '');

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
        handleValidateNotEmpty: (props) => (value) => (value === undefined || value.trim().length === 0)
    }),
    flattenProp('state'),
) (View);
