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

export const txMapping = {
    properties: {
        BlockHash: {
            type: 'keyword'
        },
        BlockIndex: {
            type: 'integer'
        },
        Hash: {
            type: 'keyword'
        },
        Size: {
            type: 'integer'
        },
        Type: {
            type: 'integer'
        },
        Version: {
            type: 'integer'
        },
        Timestamp: {
            type: 'long'
        },
        Result: {
            type: 'boolean'
        },
        Events: {
            enabled: false
        }
    }
};

export const blockMapping = {
    properties: {
        Hash: {
            type: 'keyword'
        },
        Version: {
            type: 'integer'
        },
        PrevBlockHash: {
            type: 'keyword'
        },
        Timestamp: {
            type: 'long',
        },
        Height: {
            type: 'long',
        },
    }
};

export const assetBalanceMapping = {
    properties: {
        asset: {
            type: 'keyword'
        },
        balance: {
            type: 'double'
        }
    }
};

export const accountMapping = {
    properties: {
        address: {
            type: 'keyword'
        },
        assets: {
            type: 'nested',
            ...assetBalanceMapping
        },
        firstTime: {
            type: 'long'
        },
        firstTx: {
            type: 'keyword'
        },
        lastTime: {
            type: 'long'
        },
        lastTx: {
            type: 'keyword'
        },
        transactionsCount: {
            type: 'long'
        },
    }
};

export const TransferMapping = {
    properties: {
        Id: {
            type: 'keyword'
        },
        TxHash: {
            type: 'keyword'
        },
        BlockHash: {
            type: 'keyword'
        },
        BlockIndex: {
            type: 'integer'
        },
        From: {
            type: 'keyword'
        },
        To: {
            type: 'keyword'
        },
        Asset: {
            type: 'keyword'
        },
        Value: {
            type: 'double'
        },
        Timestamp: {
            type: 'long'
        },
    }
};

export const ClaimMapping = {
    properties: {
        TxHash: {
            type: 'keyword'
        },
        Timestamp: {
            type: 'long'
        },
    }
};

export const OntIdMapping = {
    properties: {
        Id: {
            type: 'keyword'
        },
        RegistrationTxHash: {
            type: 'keyword'
        },
        RegistrationTimestamp: {
            type: 'long'
        },
        LastTimestamp: {
            type: 'long'
        },
        LastTxHash: {
            type: 'keyword'
        },
        assets: {
            type: 'nested',
            ...ClaimMapping
        },
    }
};

export enum Indices {
    Tx = 'index_transaction',
    Transfer = 'index_transfer',
    Block = 'index_block',
    Account = 'index_account',
    OntId = 'index_ont_id'
}