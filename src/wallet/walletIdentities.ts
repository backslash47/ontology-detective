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

import { compose, withProps } from 'recompose';
import { Location } from 'history';
import { Wallet } from 'ont-sdk-ts';
import innerGrid from '~/common/innerGrid';
import { Direction } from '~/common/gridTypes';
import { SortColumn, getOntIdsByIds } from '~/shared/ontIdApi';
import { OntId } from '~/shared/ont/model';
import View from '~/ontIds/embeddedOntIdsGridView';
import { Props } from '~/ontIds/ontIdsGrid';

interface PropsOuter {
    location: Location;
    wallet: Wallet;
}

export default compose<Props, PropsOuter>(
    withProps<{}, PropsOuter>((props) => ({
        dataLoader: (
            from: number, 
            size: number, 
            sortColumn: SortColumn, 
            order: Direction
        ) => getOntIdsByIds(props.wallet.identities.map(a => a.ontid), from, size, sortColumn, order),
        sort: 'LastTimestamp',
        order: 'descending',
    })),
    innerGrid<OntId, SortColumn>('identities')
) (View);
