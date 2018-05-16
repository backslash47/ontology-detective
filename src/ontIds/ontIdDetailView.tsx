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
import { Breadcrumb, Segment, Table, Header, Popup, Loader, Button } from 'semantic-ui-react';
import { distanceInWordsToNow, format } from 'date-fns';
import { PropsInner as Props } from './ontIdDetail';
import OntIdDdoAttributes from './ontIdDdoAttributes';
import OntIdDdoClaims from './ontIdDdoClaims';

const OntIdView: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Header as="h2">
                <Breadcrumb size="huge">
                    <Breadcrumb.Section as={Link} to="/ont-ids">ONT IDs</Breadcrumb.Section>
                    <Breadcrumb.Divider icon="right chevron" />
                    <Breadcrumb.Section active={true}>{props.id}</Breadcrumb.Section>
                    {props.own ? (
                        <Breadcrumb.Section active={true} className="bold">&nbsp;(Own)</Breadcrumb.Section>
                    ) : null}
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

        {props.loaded && props.ddo !== undefined && props.ddo.Attributes.length > 0 ? (
            <Segment>
                <Header as="h2">DDO Attributes</Header>
                    <OntIdDdoAttributes attributes={props.ddo.Attributes}/>
            </Segment>
        ) : null}

        {props.loaded && props.ddo !== undefined && ((props.ddo.Claims.length > 0) || props.own)  ? (
            <Segment>
                <Header as="h2">DDO Claims</Header>
                {props.own ? (
                    <>
                        <Button as={Link} to={`/ont-ids/${props.ontId.Id}/create-claim`} size="large">Add claim</Button>
                        <Button 
                            as={Link} 
                            to={`/ont-ids/${props.ontId.Id}/request-email-claim`} 
                            size="large"
                        >
                            Request email claim
                        </Button>
                        <Button 
                            as={Link} 
                            to={`/ont-ids/${props.ontId.Id}/request-qes-claim`} 
                            size="large"
                        >
                            Request QES claim
                        </Button>
                    </>
                ) : null}
                <OntIdDdoClaims claims={props.ddo.Claims}/>
            </Segment>
        ) : null}
    </Segment.Group>
);

export default OntIdView;
