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

import { compose, withState, lifecycle, withHandlers, flattenProp } from 'recompose';
import { get } from 'lodash';
import { Location } from 'history';
import { withRouter } from 'react-router-dom';
import { Wallet } from 'ont-sdk-ts';
import { Result } from 'react-file-reader-input';
import * as FileSaver from 'file-saver';
import { StateSetter } from '~/utils';
import View from './walletView';
import { clearWallet, saveWallet, loadWallet } from '~/shared/walletApi';

interface PropsOuter {
    location: Location;
}

interface State {
    wallet?: Wallet;
}

interface Handlers {
    handleSave: () => void;
    handleClose: () => void;
    handleOpen: (event: React.SyntheticEvent<{}>, results: Result[]) => void;
}

export interface PropsInner extends Handlers, State, PropsOuter {
}

function load(props: StateSetter<State>) {
    const wallet = loadWallet();
    if (wallet !== null) {
        props.setState({
            ...props.state,
            wallet
        });
    }
}

export default compose<PropsInner, PropsOuter>(
    withRouter,
    withState<null, Partial<State>, 'state', 'setState'>('state', 'setState', {
    }),
    withHandlers<StateSetter<State>, Handlers>({
        handleSave: (props) => () => {
            const wallet = props.state.wallet;

            if (wallet !== undefined) {
                const blob = new Blob([wallet.toJson()], {type: 'text/plain;charset=utf-8'});
                FileSaver.saveAs(blob, 'wallet.json');
            }
        },
        handleClose: (props) => () => {
            clearWallet();

            props.setState({
                ...props.state,
                wallet: undefined
            });
        },
        handleOpen: (props) => async (event: React.SyntheticEvent<{}>, results: Result[]) => {
            const [e] = results[0];
            
            if (e !== null && e.target !== null) {
                const data: string = get(e.target, 'result');
                
                saveWallet(data);
                load(props);
            }
        }
    }),
    lifecycle<StateSetter<State> & Handlers, null>({
        componentDidMount() {
            load(this.props);
        }
    }),
    flattenProp('state')
) (View);
