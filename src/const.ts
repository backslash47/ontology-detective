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

export enum Assets {
    ONT = 'ff00000000000000000000000000000000000001',
    ONG = 'ff00000000000000000000000000000000000002',
    ONT_ID = '80e7d2fc22c24c466f44c7688569cc6e6d6c6f92',
    ONT_ID2 = '8055b362904715fd84536e754868f4c8d27ca3f6'
}

export enum OntIdAction {
    Register = 'Register',
    Attribute = 'Attribute'
}

export enum OntIdRegisterOperation {
    register = 'register'
}

export enum OntIdAttributeOperation {
    add = 'add'
}

export const AssetIdToName = {
    [Assets.ONT] : 'ONT',
    [Assets.ONG] : 'ONG',
    [Assets.ONT_ID] : 'ONT ID',
    [Assets.ONT_ID2] : 'ONT ID v2'
};

export const restUrl = 'http://polaris1.ont.io:20334';
export const websocketUrl = 'ws://polaris1.ont.io:20335';
