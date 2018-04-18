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
import { Breadcrumb, Segment, Header, Message, Button, Form as SemanticForm, Loader } from 'semantic-ui-react';
import { InputField, Form } from '~/form/formWrapper';
import { PropsInner as Props } from './transfer';

const assetOptions = [
    {
        text: 'ONT',
        value: 'ONT'
    },
    {
        text: 'ONG',
        value: 'ONG'
    },
];

const CreateAccount: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Header as="h2">
                <Breadcrumb size="huge">
                    <Breadcrumb.Section as={Link} to="/wallet">Wallet</Breadcrumb.Section>
                    <Breadcrumb.Divider icon="right chevron" />
                    <Breadcrumb.Section active={true}>Transfer asset</Breadcrumb.Section>
                </Breadcrumb>
            </Header>
        </Segment>
        <Segment>
            <Message>
                <p>
                    Check the destination address twice before sending any asset.
                </p>
            </Message>
            {props.sending ? (
                <Loader active={true} inline="centered">Transfering ...</Loader>
            ) : ( null )}
            <FinalForm onSubmit={props.handleSend} component={Form}>
                <Message error={true}>
                    <p>
                        Failed to transfer asset !
                    </p>
                </Message>
                {!props.sending ? (
                    <>
                        <Field
                            name="password"
                            component={InputField}
                            fluid={true} 
                            label="Password" 
                            type="password"
                            validate={props.handleValidateNotEmpty}
                            size="large"
                        />
                        <SemanticForm.Dropdown 
                            fluid={true} 
                            label="Asset" 
                            selection={true} 
                            options={assetOptions} 
                            size="large"
                            value="ONT"
                            disabled={true}
                        />
                        <Field
                            name="destination" 
                            component={InputField} 
                            fluid={true} 
                            label="Destination address"
                            validate={props.handleValidateAddress}
                            size="large"
                        />
                        <Field
                            name="amount" 
                            component={InputField} 
                            fluid={true} 
                            label="Amount"
                            validate={props.handleValidateNotEmpty}
                            size="large"
                            type="number"
                        />
                        <Button size="large">Send</Button>
                    </>
                ) : null}
            </FinalForm>
        </Segment>
    </Segment.Group>
);

export default CreateAccount;
