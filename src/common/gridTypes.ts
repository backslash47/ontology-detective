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

import { RouteComponentProps } from 'react-router';
import { Location } from 'history';

export interface PropsOuter<T, SC> extends RouteComponentProps<{}> {
    hideTitle?: boolean;
    sort: SC;
    order: Direction;
    dataLoader: (from: number, size: number, sortColumn: SC, direction: Direction) => Promise<Result<T>>;
}

export interface QueryParams<SC> {
    page: string;
    sort: SC;
    order: Direction;
}

export interface PropsOwn<SC> extends QueryParams<SC> {
    pageSize: number;
}

export interface State<T> {
    items: T[];
    count: number;
    firstIndex: number;
    lastIndex: number;
    prevLink: Location;
    nextLink: Location;
    hasPrev: boolean;
    hasNext: boolean;
}

export interface Handlers<SC> {
    load: (page: number, sortColumn: SC, direction: Direction) => Promise<void>;
    getColumnSortLink: (column: SC) => Location;
}

export interface Result<T> {
    items: T[];
    count: number;
}

export interface PropsInner<T, SC> extends State<T>, PropsOwn<SC>, Handlers<SC>, PropsOuter<T, SC> {
}

export type Direction = 'ascending' | 'descending';
