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

import { compose, lifecycle, withProps, withState, withHandlers, flattenProp, ComponentEnhancer } from 'recompose';
import * as Query from 'query-string';
import { PropsInner, PropsOuter, PropsOwn, QueryParams, State, Handlers, Direction } from './gridTypes';
import { StateSetter, changeQueryParam } from '~/utils';

function remoteGrid<T, SC>(): ComponentEnhancer<PropsInner<T, SC>, PropsOuter<T, SC>> {
    return compose(
        withProps<PropsOwn<SC>, PropsOuter<T, SC>>(props => { 
            const queryParams = {
                ...{ sort: props.sort, order: props.order, page: 0 }, 
                ...Query.parse(props.location.search) as QueryParams<SC>
            };

            return {
                pageSize: 20,
                ...queryParams
            };
        }),
        withState<PropsOuter<T, SC>, State<T>, 'state', 'setState'>('state', 'setState', ({ location }) => ({
            loading: false,
            items: [],
            count: 0,
            prevLink: location,
            nextLink: location,
            firstIndex: 0,
            lastIndex: 0,
            hasPrev: false,
            hasNext: false
        })),
        withHandlers<PropsOuter<T, SC> & PropsOwn<SC> & StateSetter<State<T>>, Handlers<SC>>({
            load: ({ 
                pageSize, 
                setState, 
                location, 
                dataLoader,
                state 
            }) => async (page: number, sort: SC, order: Direction) => {

                setState({...state, loading: true});
                
                const { count, items } = await dataLoader(page * pageSize, pageSize, sort, order);

                const firstIndex = Math.max(page * pageSize + 1, 0);
                const lastIndex = Math.min((page + 1) * pageSize, count);

                const prevLink = firstIndex > 1 ? changeQueryParam(location, 'page', String(page - 1)) : location;
                const nextLink = lastIndex < count ? changeQueryParam(location, 'page', String(page + 1)) : location;

                setState({
                    loading: false,
                    items,
                    count,
                    firstIndex,
                    lastIndex,
                    prevLink,
                    nextLink,
                    hasPrev: firstIndex > 1,
                    hasNext: lastIndex < count
                });
            },
            getColumnSortLink: ({location, order, sort}) => (column: SC) => {
                if (sort === column) {
                    return changeQueryParam(location, 'order', order === 'ascending' ? 'descending' : 'ascending');
                } else {
                    const resetOrder = changeQueryParam(location, 'order', 'ascending');
                    return changeQueryParam(resetOrder, 'sort', column.toString());
                }
            }
        }),
        flattenProp('state'),
        lifecycle<PropsOwn<SC> & State<T> & Handlers<SC>, null>({
            async componentDidMount() {
                await this.props.load(Number(this.props.page), this.props.sort, this.props.order);
            },

            async componentWillReceiveProps(nextProps: PropsOwn<SC>) {
                if (this.props.page !== nextProps.page ||
                    this.props.sort !== nextProps.sort ||
                    this.props.order !== nextProps.order) {
                    
                    await this.props.load(Number(nextProps.page), nextProps.sort, nextProps.order);
                }
            }
        }),
    );
}

export default remoteGrid;
