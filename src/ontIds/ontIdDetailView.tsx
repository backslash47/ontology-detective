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
import { PropsInner as Props } from './ontIdDetail';
import OntIdClaims from './ontIdClaims';

const OntIdView: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Header as="h2">
                <Breadcrumb size="huge">
                    <Breadcrumb.Section as={Link} to="/ont-ids">Ont Ids</Breadcrumb.Section>
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
                            <Table.Cell width={1}>Created</Table.Cell>
                            <Table.Cell width={1}>
                                <Link to={`/transactions/${props.ontId.RegistrationTxHash}`}>
                                    <Popup 
                                        trigger={<span>{distanceInWordsToNow(props.ontId.RegistrationTimestamp)}</span>}
                                    >
                                        {format(props.ontId.RegistrationTimestamp, 'MMM Do YYYY HH:mm:ss')}
                                    </Popup>
                                </Link>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell width={1}>Last modified</Table.Cell>
                            <Table.Cell width={1}>
                                <Link to={`/transactions/${props.ontId.LastTxHash}`}>
                                    <Popup trigger={<span>{distanceInWordsToNow(props.ontId.LastTimestamp)}</span>}>
                                        {format(props.ontId.LastTimestamp, 'MMM Do YYYY HH:mm:ss')}
                                    </Popup>
                                </Link>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                )}
            </Table>
        </Segment>
        {props.loaded && props.ontId.ClaimsCount > 0 ? (
            <Segment>
                <Header as="h2">Claims</Header>
                    <OntIdClaims claims={props.ontId.Claims}/>
            </Segment>
        ) : null}
    </Segment.Group>
);

export default OntIdView;