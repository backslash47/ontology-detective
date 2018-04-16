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

import { compose, lifecycle, withProps } from 'recompose';
import { login as loginElastic } from '~/shared/elastic/api';
import { Item } from '~/sidebar/sidebar';
import AppView from './appView';
const walletIcon = require('./wallet.svg');

export interface PropsInner {
  menu: Item[];
}

const menu: Item[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    link: '/'
  },
  {
    id: 'blocks',
    label: 'Blocks',
    icon: 'block layout',
    link: '/blocks'
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: 'cubes',
    link: '/transactions'
  },
  {
    id: 'transfers',
    label: 'Transfers',
    icon: 'exchange',
    link: '/transfers'
  },
  {
    id: 'accounts',
    label: 'Accounts',
    icon: 'users',
    link: '/accounts'
  },
  {
    id: 'ontIds',
    label: 'ONT IDs',
    icon: 'id card',
    link: '/ont-ids'
  },
  {
    id: 'wallet',
    label: 'Wallet',
    customIcon: walletIcon,
    link: '/wallet'
  }
];

export default compose<PropsInner, {}>(
  lifecycle<{}, {}>({
    componentWillMount() {
      loginElastic(process.env.REACT_APP_API_URL || 'http://localhost:9200');
    }
  }),
  withProps<PropsInner, {}>({
    menu
  })
)(AppView);
