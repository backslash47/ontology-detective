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
import { Link } from 'react-router-dom';
import { Breadcrumb, Segment, Table, Header, Popup } from 'semantic-ui-react';
import { distanceInWordsToNow, format } from 'date-fns';
import { AssetIdToName } from '~/const';
import { PropsInner as Props } from './accountDetail';
import AccountTransfers from './accountTransfers';

const Transaction: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Header as="h2">
                <Breadcrumb size="huge">
                    <Breadcrumb.Section as={Link} to="/accounts">Accounts</Breadcrumb.Section>
                    <Breadcrumb.Divider icon="right chevron" />
                    <Breadcrumb.Section active={true}>{props.account.address}</Breadcrumb.Section>
                </Breadcrumb>
            </Header>
        </Segment>
        <Segment>
            <Table celled={false} basic="very" selectable={true} fixed={true}>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell width={1}>Created</Table.Cell>
                        <Table.Cell width={1}>
                            <Link to={`/transactions/${props.account.firstTx}`}>
                                <Popup trigger={<span>{distanceInWordsToNow(props.account.firstTime)}</span>}>
                                    {format(props.account.firstTime, 'MMM Do YYYY HH:mm:ss')}
                                </Popup>
                            </Link>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={1}>Last transaction</Table.Cell>
                        <Table.Cell width={1}>
                            <Link to={`/transactions/${props.account.lastTx}`}>
                                <Popup trigger={<span>{distanceInWordsToNow(props.account.lastTime)}</span>}>
                                    {format(props.account.lastTime, 'MMM Do YYYY HH:mm:ss')}
                                </Popup>
                            </Link>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={1}>Transactions count</Table.Cell>
                        <Table.Cell width={1}>{props.account.transactionsCount}</Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </Segment>
        <Segment>
            <Header as="h2">Assets</Header>
                <Table celled={false} basic="very" selectable={true} fixed={true}>
                    <Table.Body>
                        {props.account.assets.map(assetBalance => (
                            <Table.Row>
                                <Table.Cell width={1} >{AssetIdToName[assetBalance.asset]}</Table.Cell>
                                <Table.Cell width={1} className="bold">{assetBalance.balance}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
        </Segment>
        
        <AccountTransfers address={props.account.address} location={props.location} />
    </Segment.Group>
);

export default Transaction;
