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
import { Table, Breadcrumb, Segment, Button, Popup, Header } from 'semantic-ui-react';
import { distanceInWordsToNow, format } from 'date-fns';
import { Props } from './transfersGrid';
import { AssetIdToName } from '~/const'; 

const Transfers: React.SFC<Props> = (props) => (
    <Segment.Group>
        {!props.hideTitle ? (
            <Segment>
                <Header as="h2">
                    <Breadcrumb size="huge">
                        <Breadcrumb.Section active={true}>Transfers</Breadcrumb.Section>
                    </Breadcrumb>
                </Header>
            </Segment>
        ) : null }
        <Segment>
            <Table celled={false} basic="very" selectable={true} sortable={true} fixed={true}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell
                            sorted={props.sort === 'Value' ? props.order : undefined}
                            selectable={true}
                            width={1}
                        >
                            <Link to={props.getColumnSortLink('Value')}>Value</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={props.sort === 'Asset' ? props.order : undefined}
                            selectable={true}
                            width={1}
                        >
                            <Link to={props.getColumnSortLink('Asset')}>Asset</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={props.sort === 'From' ? props.order : undefined}
                            selectable={true}
                            width={4}
                        >
                            <Link to={props.getColumnSortLink('From')}>From</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={props.sort === 'To' ? props.order : undefined}
                            selectable={true}
                            width={4}
                        >
                            <Link to={props.getColumnSortLink('To')}>To</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={props.sort === 'Timestamp' ? props.order : undefined}
                            selectable={true}
                            width={1}
                        >
                            <Link to={props.getColumnSortLink('Timestamp')}>Time</Link>
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={props.sort === 'Result' ? props.order : undefined}
                            selectable={true}
                            width={1}
                        >
                            <Link to={props.getColumnSortLink('Result')}>Result</Link>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {props.items.map(transfer => (
                        <Table.Row key={transfer.Id} negative={!transfer.Result}>
                            <Table.Cell selectable={true}>
                                <Link to={`/transfers/${transfer.Id}`}>{transfer.Value}</Link>
                            </Table.Cell>
                            <Table.Cell selectable={true}>
                                <Link to={`/transfers/${transfer.Id}`}>{AssetIdToName[transfer.Asset]}</Link>
                            </Table.Cell>
                            <Table.Cell 
                                selectable={true} 
                                className={props.highlightAddress === transfer.From ? 'bold' : ''}
                            >
                                <Link to={`/transfers/${transfer.Id}`}>{transfer.From}</Link>
                            </Table.Cell>
                            <Table.Cell 
                                selectable={true} 
                                className={props.highlightAddress === transfer.To ? 'bold' : ''}
                            >
                                <Link to={`/transfers/${transfer.Id}`}>{transfer.To}</Link>
                            </Table.Cell>
                            <Table.Cell selectable={true}>
                                <Link to={`/transfers/${transfer.Id}`}>
                                    <Popup trigger={<span>{distanceInWordsToNow(transfer.Timestamp)}</span>}>
                                        {format(transfer.Timestamp, 'MMM Do YYYY HH:mm:ss')}
                                    </Popup>
                                </Link>
                            </Table.Cell>
                            <Table.Cell selectable={true}>
                                <Link to={`/transfers/${transfer.Id}`}>
                                    {transfer.Result ? 'Success' : 'Failed'}
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

export default Transfers;
