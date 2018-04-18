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

export interface GetBlockByHeightResponse {
    Action: string;
    Desc: string;
    Error: number;
    Result: BlockWrapper;
    Version: string;
}

export interface BlockWrapper {
    Hash: string;
    Header: Block;
    Transactions: Transaction[];
}

export interface Block {
    Version: number;
    PrevBlockHash: string;
    TransactionsRoot: string;
    BlockRoot: string;
    Timestamp: number;
    Height: number;
    ConsensusData: string;
    NextBookkeeper: string;
    Bookkeepers: string[];
    SigData: string[];
    Hash: string;
    TransactionsCount: number;          // computed
}

export enum AttributeUsage {
    Nonce = 0x00,
    Script = 0x20,
    DescriptionUrl = 0x81,
    Description = 0x90,
}

export interface Attribute {
    Usage: AttributeUsage;
    Data: string;
    Size: number;
}

export interface Fee {
    Amount: number;
    Payer: string;
}

export enum TxType {
    BookKeeping = 0x00,
    IssueAsset = 0x01,
    BookKeeper = 0x02,
    Claim = 0x03,
    PrivacyPayload = 0x20,
    RegisterAsset = 0x40,
    TransferAsset = 0x80,
    Record = 0x81,
    Deploy = 0xd0,
    Invoke = 0xd1,
    DataFile = 0x12,
    Enrollment = 0x04,
    Vote = 0x05
}

export const TxName = {
    [TxType.BookKeeping]: 'Book Keeping',
    [TxType.IssueAsset]: 'Issue Asset',
    [TxType.BookKeeper]: 'Book Keeper',
    [TxType.Claim]: 'Claim',
    [TxType.PrivacyPayload]: 'Privacy Pay load',
    [TxType.RegisterAsset]: 'Register Asset',
    [TxType.TransferAsset]: 'Transfer Asset',
    [TxType.Record]: 'Record',
    [TxType.Deploy]: 'Deploy',
    [TxType.Invoke]: 'Smart contract',
    [TxType.DataFile]: 'Data File',
    [TxType.Enrollment]: 'Enrollment',
    [TxType.Vote]: 'Vote'
};

export interface Transaction {
    Version: number;
    Nonce: number;
    TxType: TxType;
    Payload: Payload;
    Attributes: Attribute[];
    Fee: Fee[];
    NetworkFee: number;
    Sigs: Sig[];
    Hash: string;
    BlockHash: string;              // computed
    BlockIndex: number;             // computed
    Timestamp: number;              // computed
    Result: boolean;                // computed
    Events: Event[] | null;         // computed
    EventsLoaded?: boolean;         // computed
}

export interface Payload {
    Code: string;
    GasLimit: number;
    VmType: number; 
    Nonce: number;
}

export interface Sig {
    PubKeys: string[];
    M: number;
    SigData: string[];
}

export type Account = {
    address: string;
    u160Address: string,
    firstTime?: number;
    firstTx?: string;
    lastTime?: number;
    lastTx?: string;
    transactionsCount: number;
    ontBalance: number;
    ongBalance: number;
};

export type Transfer = {
    Id: string;
    TxHash: string;
    BlockHash: string;
    BlockIndex: number;
    From?: string;
    To: string;
    Asset: string;
    Value: number;
    Timestamp: number;
};

export interface Event {
    CodeHash: number[] | string;
    States: (string | number[] | string[])[];
    TxHash: number[] | string;
}

export type Claim = {
    TxHash: string;
    Timestamp: number;
    Attribute: string;
};

export type OntId = {
    Id: string;
    RegistrationTxHash: string;
    RegistrationTimestamp: number;
    LastTimestamp: number;
    LastTxHash: string;
    Claims: Claim[];            // it is not really claims but attributes
    ClaimsCount: number;
    CodeHash: string;
};

export type DdoClaim = {
    Id: string;
    Issuer: string | null;
    Timestamp: number | null;
    Content: string | null;
};

export type DdoAttribute = {
    Id: string;
    Type: string;
    Value: string;
};

export type Ddo = {
    Attributes: DdoAttribute[];
    Claims: DdoClaim[];
};
