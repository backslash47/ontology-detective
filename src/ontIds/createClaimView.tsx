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
import { Breadcrumb, Segment, Header, Loader, Form, Message } from 'semantic-ui-react';
import { PropsInner as Props } from './createClaim';

const OntIdView: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Header as="h2">
                <Breadcrumb size="huge">
                    <Breadcrumb.Section as={Link} to="/ont-ids">ONT IDs</Breadcrumb.Section>
                    <Breadcrumb.Divider icon="right chevron" />
                    <Breadcrumb.Section as={Link} to={`/ont-ids/${props.id}`}>{props.id}</Breadcrumb.Section>
                    <Breadcrumb.Section active={true} className="bold">&nbsp;(Own)</Breadcrumb.Section>
                    <Breadcrumb.Divider icon="right chevron" />
                    <Breadcrumb.Section active={true}>Create claim</Breadcrumb.Section>
                </Breadcrumb>
            </Header>
        </Segment>
        <Segment>
            <Message>
                <p>
                    This wizzard creates new self signed claim. Context can be any string representing the type
                    of claim. Content should be JSON formatted string representing the claim.
                </p>
                <p>Password supplied during ONT ID creation is required.</p>
            </Message>
            {props.registering ? (
                <Loader active={true} inline="centered">Asserting Claim on blockchain ...</Loader>
            ) : (
                <Form warning={props.wrong !== null} onSubmit={props.handleCreate}>
                    <Message warning={true}>{props.wrong}</Message>
                    <Form.Input 
                        fluid={true} 
                        label="Password" 
                        type="password"
                        onChange={props.handlePasswordChange} 
                    />
                    <Form.Input 
                        fluid={true} 
                        label="Context" 
                        onChange={props.handleContextChange} 
                        placeholder="claim:standard0001"
                    />
                    <Form.TextArea 
                        label="Content"
                        onChange={props.handleContentChange} 
                    />
                    <Form.Button>Create</Form.Button>
                </Form>
            )}
        </Segment>
    </Segment.Group>
);

export default OntIdView;
