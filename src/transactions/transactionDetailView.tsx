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
import { TxName } from '~/shared/ont/model'; 
import { PropsInner as Props } from './transactionDetail';
import TransactionTransfers from './transactionTransfers';

const Transaction: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Header as="h2">
                <Breadcrumb size="huge">
                    <Breadcrumb.Section as={Link} to="/transactions">Transactions</Breadcrumb.Section>
                    <Breadcrumb.Divider icon="right chevron" />
                    <Breadcrumb.Section active={true}>{props.txId}</Breadcrumb.Section>
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
                            <Table.Cell width={1}>Type</Table.Cell>
                            <Table.Cell width={1}>{TxName[props.transaction.TxType]}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>Time</Table.Cell>
                            <Table.Cell width={1}>
                                <Popup trigger={<span>{distanceInWordsToNow(props.transaction.Timestamp)}</span>}>
                                    {format(props.transaction.Timestamp, 'MMM Do YYYY HH:mm:ss')}
                                </Popup>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>Network fee</Table.Cell>
                            <Table.Cell width={1}>{props.transaction.NetworkFee} ONG</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>Block</Table.Cell>
                            <Table.Cell width={1}>
                                <Link to={`/blocks/${props.transaction.BlockHash}`}>
                                    {props.transaction.BlockIndex}
                                </Link>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                )}
            </Table>
        </Segment>

        <TransactionTransfers transactionHash={props.txId} location={props.location} />
    </Segment.Group>
);

export default Transaction;
