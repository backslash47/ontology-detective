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
import { Segment, Menu, Icon, Responsive, Dropdown } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import './sidebar.css';
import { PropsOuter as Props } from './sidebar';
const logo = require('./ontsymbol.png');

const SidebarView: React.SFC<Props> = (props) => (
    <div>
        <Responsive
            as={Menu}
            maxWidth={767}
            inverted={true}
        >
            <Menu.Item className="logo" as="a" href="http://ont.io/">
                <img src={logo} />
            </Menu.Item>
            <Menu.Menu position="right">
                <Dropdown item={true} icon={(<Icon name="sidebar" size="large"/>)}>
                    <Dropdown.Menu className="inverted">
                        {props.items.map(item => (
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
        >
            <Menu.Item className="logo" as="a" href="http://ont.io/">
                <img src={logo} />
            </Menu.Item>
            {props.items.map(item => (
                <Menu.Item key={item.id} name={item.id} as={Link} to={item.link}>
                    {item.icon != null ? <Icon name={item.icon} /> : null}
                    {item.customIcon != null ? <img className="icon" src={item.customIcon} /> : null}
                    {item.label}
                </Menu.Item>
            ))}
        </Responsive>
        <Segment className="main" basic={true}>
            {props.children}
        </Segment>
        {props.footerComponent ? (
            <Segment basic={true} className="footer">
                <props.footerComponent/>
            </Segment>
        ) : null}
    </div>
);

export default SidebarView;
