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
import { Table, Popup } from 'semantic-ui-react';
import { distanceInWordsToNow, format } from 'date-fns';
import { Transaction, TxName } from '~/shared/ont/model';

export interface Props {
    transactions: Transaction[];
}

const BlockTransactionsView: React.SFC<Props> = (props) => (
    <Table celled={false} basic={true} selectable={true}>
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Hash</Table.HeaderCell>
                <Table.HeaderCell>Time</Table.HeaderCell>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {props.transactions.map(transaction => (
                <Table.Row key={transaction.Hash}>
                    <Table.Cell selectable={true}>
                        <Link to={`/transactions/${transaction.Hash}`}>{TxName[transaction.TxType]}</Link>
                    </Table.Cell>
                    <Table.Cell selectable={true}>
                        <Link to={`/transactions/${transaction.Hash}`}>{transaction.Hash}</Link>
                    </Table.Cell>
                    <Table.Cell selectable={true}>
                        <Link to={`/blocks/${transaction.Hash}`}>
                            <Popup trigger={<span>{distanceInWordsToNow(transaction.Timestamp)}</span>}>
                                {format(transaction.Timestamp, 'MMM Do YYYY HH:mm:ss')}
                            </Popup>
                        </Link>
                    </Table.Cell>
                </Table.Row>
            ))}
        </Table.Body>
    </Table>
);

export default BlockTransactionsView;
