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
import { Table, Breadcrumb, Segment, Button, Popup, Header, Loader } from 'semantic-ui-react';
import { distanceInWordsToNow, format } from 'date-fns';
import { Props } from './transactionsGrid';
import { TxName } from '~/shared/ont/model'; 

const Transactions: React.SFC<Props> = (props) => (
    <Segment.Group>
        {!props.hideTitle ? (
            <Segment>
                <Header as="h2">
                    <Breadcrumb size="huge">
                        <Breadcrumb.Section active={true}>Transactions</Breadcrumb.Section>
                    </Breadcrumb>
                </Header>
            </Segment>
        ) : null }
        <Segment>
            <Table celled={false} basic="very" selectable={true} sortable={true} fixed={true}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell
                            sorted={props.sort === 'TxType' ? props.order : undefined}
                            selectable={true}
                            width={3}
                        >
                            <Link to={props.getColumnSortLink('TxType')}>Type</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={props.sort === 'Hash' ? props.order : undefined}
                            selectable={true}
                            width={11}
                        >
                            <Link to={props.getColumnSortLink('Hash')}>Hash</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={props.sort === 'Timestamp' ? props.order : undefined}
                            selectable={true}
                            width={2}
                        >
                            <Link to={props.getColumnSortLink('Timestamp')}>Time</Link>
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
                    {props.items.map(transaction => (
                        <Table.Row key={transaction.Hash}>
                            <Table.Cell selectable={true}>
                                <Link to={`/transactions/${transaction.Hash}`}>{TxName[transaction.TxType]}</Link>
                            </Table.Cell>
                            <Table.Cell selectable={true}>
                                <Link to={`/transactions/${transaction.Hash}`}>{transaction.Hash}</Link>
                            </Table.Cell>
                            <Table.Cell selectable={true}>
                                <Link to={`/transactions/${transaction.Hash}`}>
                                    <Popup trigger={<span>{distanceInWordsToNow(transaction.Timestamp)}</span>}>
                                        {format(transaction.Timestamp, 'MMM Do YYYY HH:mm:ss')}
                                    </Popup>
                                </Link>
                            </Table.Cell>
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

export default Transactions;
