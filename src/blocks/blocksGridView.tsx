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
import { Props } from './blocksGrid';

const Blocks: React.SFC<Props> = (props: Props) => (
    <Segment.Group>
        <Segment>
            <Header as="h2">
                <Breadcrumb size="huge">
                    <Breadcrumb.Section active={true}>Blocks</Breadcrumb.Section>
                </Breadcrumb>
            </Header>
        </Segment>
        <Segment>
            <Table celled={false} basic="very" selectable={true} sortable={true} fixed={true}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell
                            width={2}
                            sorted={props.sort === 'Height' ? props.order : undefined}
                            selectable={true}
                        >
                            <Link to={props.getColumnSortLink('Height')}>Height</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={10}
                            sorted={props.sort === 'Hash' ? props.order : undefined}
                            selectable={true}
                        >
                            <Link to={props.getColumnSortLink('Hash')}>Hash</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={2}
                            sorted={props.sort === 'TransactionsCount' ? props.order : undefined}
                            selectable={true}
                        >
                            <Link to={props.getColumnSortLink('TransactionsCount')}>Transactions</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            width={2}
                            sorted={props.sort === 'Timestamp' ? props.order : undefined}
                            selectable={true}
                        >
                            <Link to={props.getColumnSortLink('Timestamp')}>Time</Link>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {props.loading ? (
                        <Table.Row>
                            <Table.Cell colspan={6}>
                                <Loader active={true} inline="centered"/>
                            </Table.Cell>
                        </Table.Row>
                    ) : null}
                    {props.items.map(block => (
                        <Table.Row key={block.Hash}>
                            <Table.Cell selectable={true}>
                                <Link to={`/blocks/${block.Hash}`}>{block.Height}</Link>
                            </Table.Cell>
                            <Table.Cell selectable={true}>
                                <Link to={`/blocks/${block.Hash}`}>{block.Hash}</Link>
                            </Table.Cell>
                            <Table.Cell selectable={true}>
                                <Link to={`/blocks/${block.Hash}`}>{block.TransactionsCount}</Link>
                            </Table.Cell>
                            <Table.Cell selectable={true}>
                                <Link to={`/blocks/${block.Hash}`}>
                                    <Popup trigger={<span>{distanceInWordsToNow(block.Timestamp)}</span>}>
                                        {format(block.Timestamp, 'MMM Do YYYY HH:mm:ss')}
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

export default Blocks;
