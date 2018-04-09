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

import * as Query from 'query-string';
import * as H from 'history';
import { setWith, clone, get } from 'lodash';

export interface StateSetter<T> {
    state: T;
    setState: (state: T) => T;
}

export function changeQueryParam(location: H.Location, name: string, value: string): H.Location {

    const params = Query.parse(location.search);
    params[name] = value;

    return H.createLocation({ pathname: location.pathname, search: Query.stringify(params) });
}

export function changeStateParam(location: H.Location, name: string, value: string): H.Location {
    return H.createLocation({ 
        pathname: location.pathname, 
        search: location.search,
        state: setWith(clone(get(location, 'state', {})), name, value, clone)
    });
}

export function arrayEqual<T>(arr1: T[], arr2: T[]) {
    const length = arr1.length;
    if (length !== arr2.length) {
        return false;
    }
    for (var i = 0; i < length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

export function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}
