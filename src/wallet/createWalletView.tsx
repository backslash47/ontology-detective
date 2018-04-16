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
import { Breadcrumb, Segment, Header, Form, Message, Loader } from 'semantic-ui-react';
import { PropsInner as Props } from './createWallet';

const CreateWallet: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Header as="h2">
                <Breadcrumb size="huge">
                    <Breadcrumb.Section as={Link} to="/wallet">Wallet</Breadcrumb.Section>
                    <Breadcrumb.Divider icon="right chevron" />
                    <Breadcrumb.Section active={true}>Create</Breadcrumb.Section>
                </Breadcrumb>
            </Header>
        </Segment>
        <Segment>
            <Message>
                <p>
                    This wizzard creates new private key for your wallet and encrypt it with provided
                    password. No data is transmitted to the server.
                </p>
            </Message>
            {props.registering ? (
                <Loader active={true} inline="centered">Registering ONT ID on blockchain ...</Loader>
            ) : (
                <Form onSubmit={props.handleCreate}>
                    <Form.Input 
                        fluid={true} 
                        label="Name" 
                        onChange={props.handleNameChange} 
                    />
                    <Form.Input 
                        fluid={true} 
                        label="Password"
                        type="password"
                        onChange={props.handlePasswordChange} 
                    />
                    <Form.Button>Create</Form.Button>
                </Form>
            )}
        </Segment>
    </Segment.Group>
);

export default CreateWallet;
