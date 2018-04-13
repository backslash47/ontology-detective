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
import { Breadcrumb, Segment, Table, Header, Popup, Loader } from 'semantic-ui-react';
import { distanceInWordsToNow, format } from 'date-fns';
import { PropsInner as Props } from './accountDetail';
import AccountTransfers from './accountTransfers';

const Transaction: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Header as="h2">
                <Breadcrumb size="huge">
                    <Breadcrumb.Section as={Link} to="/accounts">Accounts</Breadcrumb.Section>
                    <Breadcrumb.Divider icon="right chevron" />
                    <Breadcrumb.Section active={true}>{props.accountId}</Breadcrumb.Section>
                </Breadcrumb>
            </Header>
        </Segment>
        <Segment>
            <Table celled={false} basic="very" selectable={true} fixed={true}>
                {!props.loaded ? (
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell colSpan={2}>
                                <Loader active={true} inline="centered"/>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                ) : (
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
                )}
            </Table>
        </Segment>
        {props.loaded ? (
            <Segment>
                <Header as="h2">Assets</Header>
                    <Table celled={false} basic="very" selectable={true} fixed={true}>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell width={1}>ONT</Table.Cell>
                                <Table.Cell width={1} className="bold">{props.account.ontBalance}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell width={1}>ONG</Table.Cell>
                                <Table.Cell width={1} className="bold">{props.account.ongBalance}</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
            </Segment>
        ) : null}
        
        <AccountTransfers address={props.accountId} location={props.location} />
    </Segment.Group>
);

export default Transaction;
