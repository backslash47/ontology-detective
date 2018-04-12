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
import { Segment, Table, Popup } from 'semantic-ui-react';
import { Claim } from '~/shared/ont/model';

type Props = {
    attributes: Claim[]
};

const OntIdAttributes: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Table celled={false} basic="very" selectable={true} fixed={true}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell selectable={true} width={1}>Created</Table.HeaderCell>
                        <Table.HeaderCell selectable={true} width={1}>Attribute</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {props.attributes.map(attr => (
                        <Table.Row key={attr.Attribute}>
                            <Table.Cell width={1}>
                                <Link to={`/transactions/${attr.TxHash}`}>
                                    <Popup 
                                        trigger={<span>{distanceInWordsToNow(attr.Timestamp)}</span>}
                                    >
                                        {format(attr.Timestamp, 'MMM Do YYYY HH:mm:ss')}
                                    </Popup>
                                </Link>
                            </Table.Cell>
                            <Table.Cell width={1}>
                                {attr.Attribute}
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </Segment>
    </Segment.Group>
);

export default OntIdAttributes;
