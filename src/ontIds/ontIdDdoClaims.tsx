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
import { Segment, Table, Popup, Icon, Button } from 'semantic-ui-react';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import { DdoClaim } from '~/shared/ont/model';

type Props = {
    claims: DdoClaim[]
};

const DdoClaims: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Table celled={false} basic="very" selectable={true} fixed={true}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell selectable={true} width={6}>Issuer</Table.HeaderCell>
                        <Table.HeaderCell selectable={true} width={1}>Created</Table.HeaderCell>                        
                        <Table.HeaderCell selectable={true} width={1}>Content</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {props.claims.map(claim => (
                        <Table.Row key={claim.Id}>
                            <Table.Cell>
                                {claim.Issuer !== null ? (
                                    <Link to={`/ont-ids/${claim.Issuer}`}>{claim.Issuer}</Link>
                                ) : null}
                            </Table.Cell>
                            <Table.Cell>
                                {claim.Timestamp !== null ? (
                                    <Popup 
                                        trigger={<span>{distanceInWordsToNow(claim.Timestamp)}</span>}
                                    >
                                        {format(claim.Timestamp, 'MMM Do YYYY HH:mm:ss')}
                                    </Popup>
                                ) : null}
                            </Table.Cell>
                            <Table.Cell>
                                {claim.Content !== null ? (
                                    <Popup 
                                        trigger={(
                                            <CopyToClipboard text={claim.Content}>
                                                <Button icon={true} size="mini">
                                                    <Icon name="copy" />
                                                </Button>
                                            </CopyToClipboard>
                                        )}
                                    >
                                        <span>{claim.Content}</span>
                                    </Popup>
                                ) : null}
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </Segment>
    </Segment.Group>
);

export default DdoClaims;
