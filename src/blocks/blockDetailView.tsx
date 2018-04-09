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
import BlockTransactions from './blockTransactions';
import BlockTransfers from './blockTransfers';
import { PropsInner as Props } from './blockDetail';

const Block: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Header as="h2">
                <Breadcrumb size="huge">
                    <Breadcrumb.Section as={Link} to="/blocks">Blocks</Breadcrumb.Section>
                    <Breadcrumb.Divider icon="right chevron" />
                    <Breadcrumb.Section active={true}>
                        {props.loaded ? props.block.Height : 'Loading'}
                    </Breadcrumb.Section>
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
                            <Table.Cell width={1}>Hash</Table.Cell>
                            <Table.Cell width={1}>{props.block.Hash}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>Height</Table.Cell>
                            <Table.Cell width={1}>{props.block.Height}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>Time</Table.Cell>
                            <Table.Cell width={1}>
                                <Popup trigger={<span>{distanceInWordsToNow(props.block.Timestamp)}</span>}>
                                    {format(props.block.Timestamp, 'MMM Do YYYY HH:mm:ss')}
                                </Popup>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>Validator</Table.Cell>
                            <Table.Cell width={1}>{props.block.NextBookkeeper}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>Version</Table.Cell>
                            <Table.Cell width={1}>{props.block.Version}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>Merkle root</Table.Cell>
                            <Table.Cell width={1}>{props.block.TransactionsRoot}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                )}
            </Table>
        </Segment>

        <BlockTransactions blockHash={props.blockHash} location={props.location} />
        <BlockTransfers blockHash={props.blockHash} location={props.location} />
    </Segment.Group>
);

export default Block;
