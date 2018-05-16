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
import { Form as FinalForm, Field } from 'react-final-form';
import { Breadcrumb, Segment, Header, Loader, Message, Button } from 'semantic-ui-react';
import { InputField, Form } from '~/form/formWrapper';
import { PropsInner as Props } from './requestQesClaim';

const OntIdView: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Header as="h2">
                <Breadcrumb size="huge">
                    <Breadcrumb.Section as={Link} to="/ont-ids">ONT IDs</Breadcrumb.Section>
                    <Breadcrumb.Divider icon="right chevron" />
                    <Breadcrumb.Section as={Link} to={`/ont-ids/${props.id}`}>
                        {props.id} &nbsp;(Own)
                    </Breadcrumb.Section>
                    <Breadcrumb.Divider icon="right chevron" />
                    <Breadcrumb.Section active={true}>Request QES claim</Breadcrumb.Section>
                </Breadcrumb>
            </Header>
        </Segment>
        <Segment>
            <Message>
                <p>
                    This wizzard will request verifiable claim of full name and country using Trusted Anchor.
                </p>
                <p>Password supplied during ONT ID creation is required.</p>
            </Message>
            {props.requesting ? (
                <Loader active={true} inline="centered">Requesting QES claim ...</Loader>
            ) : (
                <>
                    <FinalForm onSubmit={props.handleRequest} component={Form}>
                        <Field
                            name="password"
                            component={InputField}
                            fluid={true} 
                            label="Password" 
                            type="password"
                            validate={props.handleValidateNotEmpty}
                            size="large"
                        />
                        <Button size="large">Download PDF</Button>                        
                    </FinalForm>
                    <form action="http://18.196.120.23:3001/validate" method="post" encType="multipart/form-data">
                        <input type="file" name="file" />
                        <Button size="large">Upload signed PDF</Button>
                    </form>
                </>
            )}
        </Segment>
    </Segment.Group>
);

export default OntIdView;
