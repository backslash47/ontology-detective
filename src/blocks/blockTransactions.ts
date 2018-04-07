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

import { compose, withProps, branch, renderNothing } from 'recompose';
import { Location } from 'history';
import innerGrid from '~/common/innerGrid';
import { Direction } from '~/common/gridTypes';
import { SortColumn, getBlockTransactions } from '~/shared/transactionsApi';
import { Transaction } from '~/shared/ont/model';
import View from '~/transactions/embeddedTransactionsGridView';
import { Props } from '~/transactions/transactionsGrid';

interface PropsOuter {
    location: Location;
    blockHash: string;
}

export default compose<Props, PropsOuter>(
    withProps<{}, PropsOuter>((props) => ({
        dataLoader: (
            from: number, 
            size: number, 
            sortColumn: SortColumn, 
            order: Direction
        ) => getBlockTransactions(props.blockHash, from, size, sortColumn, order),
        sort: 'Timestamp',
        order: 'descending',
    })),
    innerGrid<Transaction, SortColumn>('transactions'),
    branch<Props>(
        ({items}) => items.length === 0,
        renderNothing
    )
) (View);
