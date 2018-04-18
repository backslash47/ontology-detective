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
import { Menu, Icon, Responsive, Dropdown, SemanticICONS } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
const logo = require('./ontsymbol.png');
const walletIcon = require('./wallet.svg');

interface Item {
    id: string;
    label: string;
    icon?: SemanticICONS;
    customIcon?: string;
    link?: string;
}

const items: Item[] = [
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

const MenuView: React.SFC<{}> = () => (
    <>
        <Responsive
            maxWidth={767}
            as={Menu}
            inverted={true}
            className="ont-header"
        >
            <Menu.Item className="logo" as="a" href="http://ont.io/">
                <img src={logo} />
            </Menu.Item>
            <Menu.Menu position="right">
                <Dropdown item={true} icon={(<Icon name="sidebar" size="large"/>)}>
                    <Dropdown.Menu className="inverted">
                        {items.map(item => (
                            <Dropdown.Item key={item.id} name={item.id} as={Link} to={item.link}>
                                {item.icon != null ? <Icon name={item.icon} /> : null}
                                {item.customIcon != null ? <Icon as="img" src={item.customIcon} /> : null}
                                {item.label}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </Menu.Menu>
        </Responsive>
        <Responsive
            as={Menu}
            minWidth={768}
            width="thin"
            direction="top"
            icon="labeled"
            vertical={false}
            inverted={true}
            className="ont-header"
        >
            <Menu.Item className="logo" as="a" href="http://ont.io/">
                <img src={logo} />
            </Menu.Item>
            {items.map(item => (
                <Menu.Item key={item.id} name={item.id} as={Link} to={item.link}>
                    {item.icon != null ? <Icon name={item.icon} /> : null}
                    {item.customIcon != null ? <img className="icon" src={item.customIcon} /> : null}
                    {item.label}
                </Menu.Item>
            ))}
        </Responsive>
    </>
);

export default MenuView;
