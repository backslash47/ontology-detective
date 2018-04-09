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
import { AssetIdToName } from '~/const'; 
import { PropsInner as Props } from './transferDetail';

const Transfer: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Header as="h2">
                <Breadcrumb size="huge">
                    <Breadcrumb.Section as={Link} to="/transfers">Transfers</Breadcrumb.Section>
                    <Breadcrumb.Divider icon="right chevron" />
                    <Breadcrumb.Section active={true}>{props.id}</Breadcrumb.Section>
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
                            <Table.Cell width={1}>Asset</Table.Cell>
                            <Table.Cell width={1} className="bold">
                                {props.transfer.Value} {AssetIdToName[props.transfer.Asset]}
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>Time</Table.Cell>
                            <Table.Cell width={1}>
                                <Popup trigger={<span>{distanceInWordsToNow(props.transfer.Timestamp)}</span>}>
                                    {format(props.transfer.Timestamp, 'MMM Do YYYY HH:mm:ss')}
                                </Popup>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>From</Table.Cell>
                            <Table.Cell width={1}>
                                <Link to={`/accounts/${props.transfer.From}`}>{props.transfer.From}</Link>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>To</Table.Cell>
                            <Table.Cell width={1}>
                                <Link to={`/accounts/${props.transfer.To}`}>{props.transfer.To}</Link>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>Transaction</Table.Cell>
                            <Table.Cell width={1}>
                                <Link to={`/transactions/${props.transfer.TxHash}`}>{props.transfer.TxHash}</Link>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>Block</Table.Cell>
                            <Table.Cell width={1}>
                                <Link to={`/blocks/${props.transfer.BlockHash}`}>{props.transfer.BlockIndex}</Link>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                )}
            </Table>
        </Segment>
    </Segment.Group>
);

export default Transfer;
