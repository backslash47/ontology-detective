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
import { Breadcrumb, Segment, Header, Button, Message, Tab, Popup, Icon } from 'semantic-ui-react';
import * as FileReaderInput from 'react-file-reader-input';
import { PropsInner as Props } from './wallet';
import WalletAccounts from './walletAccounts';
import WalletIdentities from './walletIdentities';

const Wallet: React.SFC<Props> = (props) => (
    <Segment.Group>
        <Segment>
            <Header as="h2">
                {props.wallet !== undefined ? (
                    <Breadcrumb size="huge">
                        <Breadcrumb.Section active={true}>Wallet</Breadcrumb.Section>
                        <Breadcrumb.Divider icon="right chevron" />
                        <Breadcrumb.Section active={true}>
                            Loaded
                            &nbsp;
                            <Button.Group>
                                <Popup
                                    trigger={(
                                        <Button 
                                            icon={true} 
                                            basic={true} 
                                            compact={true} 
                                            size="big" 
                                            onClick={props.handleSave}
                                        >
                                            <i className="icon save outline" />
                                        </Button>
                                    )}
                                >
                                    Save to disk
                                </Popup>
                                <Popup
                                    trigger={(
                                        <Button 
                                            icon={true} 
                                            basic={true} 
                                            compact={true} 
                                            size="big" 
                                            onClick={props.handleClose}
                                        >
                                            <Icon name="close" />
                                        </Button>
                                    )}
                                >
                                    Close wallet
                                </Popup>
                            </Button.Group>
                        </Breadcrumb.Section>
                    </Breadcrumb>
                ) : (
                    <Breadcrumb size="huge">
                        <Breadcrumb.Section active={true}>Wallet</Breadcrumb.Section>
                    </Breadcrumb>
                )}
            </Header>
        </Segment>
        {props.wallet === undefined ? (
            <Segment>
                <Message>
                    <p>
                        This is a light-width wallet interface for ONTology blockchain. It allowes you to
                        send and receive ONT and ONG tokens without synchronizing the whole blockchain.
                    </p>
                </Message>
                <Button as={Link} to="/wallet/create" size="large">Create</Button>
                <FileReaderInput onChange={props.handleOpen} as="text">
                    <Button size="large">Open</Button>
                </FileReaderInput>
            </Segment>
        ) : (
            <Tab 
                panes={[
                    {
                        menuItem: 'Accounts',
                        render: () => (
                            <Tab.Pane>
                                <Button as={Link} to="/wallet/create-account" size="large">Create</Button>
                                {props.wallet !== undefined ? (
                                    <WalletAccounts wallet={props.wallet} location={props.location} />
                                ) : null}
                            </Tab.Pane>
                        )
                    },
                    {
                        menuItem: 'Identities',
                        render: () => (
                            <Tab.Pane>
                                <Button as={Link} to="/wallet/create-identity" size="large">Create</Button>
                                {props.wallet !== undefined ? (
                                    <WalletIdentities wallet={props.wallet} location={props.location} />
                                ) : null}
                            </Tab.Pane>
                        )
                    }
                ]} 
            />
        )}
    </Segment.Group>
);

export default Wallet;