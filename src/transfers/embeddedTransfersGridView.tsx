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
import { Segment, Header } from 'semantic-ui-react';
import TransfersGridView from './transfersGridView';
import { Props } from './transfersGrid';

const EmbeddedTransfersGridView: React.SFC<Props> = (props) => (
    <Segment>
        <Header as="h2">Transfers</Header>
        <TransfersGridView {...props} hideTitle={true} />
    </Segment>
);

export default EmbeddedTransfersGridView;
