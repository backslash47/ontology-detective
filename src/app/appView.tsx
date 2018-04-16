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

import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from '~/home/home';
import BlocksGrid from '~/blocks/blocksGrid';
import BlockDetail from '~/blocks/blockDetail';
import TransactionsGrid from '~/transactions/transactionsGrid';
import TransactionDetail from '~/transactions/transactionDetail';
import TransfersGrid from '~/transfers/transfersGrid';
import TransferDetail from '~/transfers/transferDetail';
import AccountsGrid from '~/accounts/accountsGrid';
import AccountDetail from '~/accounts/accountDetail';
import OntIdsGrid from '~/ontIds/ontIdsGrid';
import OntIdDetail from '~/ontIds/ontIdDetail';
import Wallet from '~/wallet/wallet';
import CreateWallet from '~/wallet/createWallet';
import CreateClaim from '~/ontIds/createClaim';

import Sidebar from '~/sidebar/sidebar';
import Footer from '~/footer/footer';
import { PropsInner as Props } from './app';

const App: React.SFC<Props> = (props) => (
  <Router>
    <Sidebar items={props.menu} footerComponent={Footer} >
        <Route path="/" exact={true} component={Home} />
        <Route path="/blocks" exact={true} component={BlocksGrid} />
        <Route path="/blocks/:id" exact={true} component={BlockDetail} />
        <Route path="/transactions/" exact={true} component={TransactionsGrid} />
        <Route path="/transactions/:id" exact={true} component={TransactionDetail} />
        <Route path="/transfers/" exact={true} component={TransfersGrid} />
        <Route path="/transfers/:id" exact={true} component={TransferDetail} />
        <Route path="/accounts" exact={true} component={AccountsGrid} />
        <Route path="/accounts/:id" exact={true} component={AccountDetail} />
        <Route path="/ont-ids" exact={true} component={OntIdsGrid} />
        <Route path="/ont-ids/:id" exact={true} component={OntIdDetail} />
        <Route path="/ont-ids/:id/create-claim" exact={true} component={CreateClaim} />
        <Route path="/wallet" exact={true} component={Wallet} />
        <Route path="/wallet/create" exact={true} component={CreateWallet} />
    </Sidebar>
  </Router>
);

export default App;
