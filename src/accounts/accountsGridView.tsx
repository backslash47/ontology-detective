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
import { distanceInWordsToNow, format } from 'date-fns';
import { Segment, Breadcrumb, Table, Button, Popup, Header, Loader } from 'semantic-ui-react';
import { Props } from './accountsGrid';

const Accounts: React.SFC<Props> = (props) => (
    <Segment.Group>
        {!props.hideTitle ? (
            <Segment>
                <Header as="h2">
                    <Breadcrumb size="huge">
                        <Breadcrumb.Section active={true}>Accounts</Breadcrumb.Section>
                    </Breadcrumb>
                </Header>
            </Segment>
        ) : null}
        <Segment>
            <Table celled={false} basic="very" selectable={true} sortable={true} fixed={true}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell
                            sorted={props.sort === 'address' ? props.order : undefined}
                            selectable={true}
                            width={6}
                        >
                            <Link to={props.getColumnSortLink('address')}>Address</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={props.sort === 'firstTime' ? props.order : undefined}
                            selectable={true}
                            width={2}
                        >
                            <Link to={props.getColumnSortLink('firstTime')}>Created</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={props.sort === 'lastTime' ? props.order : undefined}
                            selectable={true}
                            width={2}
                        >
                            <Link to={props.getColumnSortLink('lastTime')}>Last transaction</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={props.sort === 'transactionsCount' ? props.order : undefined}
                            selectable={true}
                            width={2}
                        >
                            <Link to={props.getColumnSortLink('transactionsCount')}>Transfers</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={props.sort === 'ontBalance' ? props.order : undefined}
                            selectable={true}
                            width={2}
                        >
                            <Link to={props.getColumnSortLink('ontBalance')}>ONT</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={props.sort === 'ongBalance' ? props.order : undefined}
                            selectable={true}
                            width={2}
                        >
                            <Link to={props.getColumnSortLink('ongBalance')}>ONG</Link>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {props.loading ? (
                        <Table.Row>
                            <Table.Cell colSpan={6}>
                                <Loader active={true} inline="centered"/>
                            </Table.Cell>
                        </Table.Row>
                    ) : null}
                    {props.items.map(account => (
                        <Table.Row key={account.address}>
                            {account.firstTime !== undefined && account.lastTime !== undefined ? (
                                <>
                                    <Table.Cell selectable={true}>
                                        <Link to={`/accounts/${account.address}`}>{account.address}</Link>
                                    </Table.Cell>
                                    <Table.Cell selectable={true}>
                                        <Link to={`/accounts/${account.address}`}>
                                            <Popup trigger={<span>{distanceInWordsToNow(account.firstTime)}</span>}>
                                                {format(account.firstTime, 'MMM Do YYYY HH:mm:ss')}
                                            </Popup>
                                        </Link>
                                    </Table.Cell>
                                    <Table.Cell selectable={true}>
                                        <Link to={`/accounts/${account.address}`}>
                                            <Popup trigger={<span>{distanceInWordsToNow(account.lastTime)}</span>}>
                                                {format(account.lastTime, 'MMM Do YYYY HH:mm:ss')}
                                            </Popup>
                                        </Link>
                                    </Table.Cell>
                                    <Table.Cell selectable={true}>
                                        <Link to={`/accounts/${account.address}`}>{account.transactionsCount}</Link>
                                    </Table.Cell>
                                    <Table.Cell selectable={true}>
                                        <Link to={`/accounts/${account.address}`}>
                                            {account.ontBalance}
                                        </Link>
                                    </Table.Cell>
                                    <Table.Cell selectable={true}>
                                        <Link to={`/accounts/${account.address}`}>
                                            {account.ongBalance}
                                        </Link>
                                    </Table.Cell>
                                </>
                            ) : (
                                <>
                                    <Table.Cell>{account.address}</Table.Cell>
                                    <Table.Cell/>
                                    <Table.Cell/>
                                    <Table.Cell>{account.transactionsCount}</Table.Cell>
                                    <Table.Cell>{account.ontBalance}</Table.Cell>
                                    <Table.Cell>{account.ongBalance}</Table.Cell>
                                </>
                            )}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </Segment>
        <Segment textAlign="right">
            {props.firstIndex} - {props.lastIndex} of {props.count} &nbsp;
            <Button disabled={!props.hasPrev} as={Link} to={props.prevLink}>Previous</Button>
            <Button disabled={!props.hasNext} as={Link} to={props.nextLink}>Next</Button>
        </Segment>
    </Segment.Group>
);

export default Accounts;
