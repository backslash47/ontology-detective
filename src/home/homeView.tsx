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
import { Grid, Header, Form, Message } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import './home.css';
import { PropsInner as Props } from './home';

const logo = require('./detective.svg');

const Home: React.SFC<Props> = (props: Props) => (
    <Grid className="home" verticalAlign="middle" columns={1} centered={true}>
        <Grid.Row>
            <Grid.Column textAlign="center">
                <Header as="h1">ONT Detective</Header>
                <img className="logo" src={logo} /> 
                <Form warning={props.invalid} onSubmit={props.handleSearch}>
                    <Form.Input 
                        fluid={true}
                        icon="search"
                        placeholder="Search by block/tx/address hash or block index"
                        input={{value: props.q}} 
                        onChange={props.handleSearchChange} 
                    />
                    <Message warning={true}>
                        Invalid account/block/transaction.
                    </Message>
                    <Form.Button className="search">Search</Form.Button>
                </Form>
                {props.redirect != null ? (<Redirect to={props.redirect}/>) : null}
            </Grid.Column>
        </Grid.Row>
    </Grid>
);

export default Home;
