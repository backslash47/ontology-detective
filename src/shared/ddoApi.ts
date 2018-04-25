import { get } from 'lodash';
import { CONST, DDO as OntDdo, Transaction, RestClient } from 'ont-sdk-ts';
import { DdoAttribute, Ddo, DdoClaim } from './ont/model';
import { buildGetDDOTx as v1buildGetDDOTx } from './contracts/v1/txBuilder.v1';
import { buildGetDDOTx as v2buildGetDDOTx } from './contracts/v2/txBuilder.v2';
import v1deserializeDDO  from './contracts/v1/deserializer.v1';
import v2deserializeDDO  from './contracts/v2/deserializer.v2';

interface DdoResponse {
    Action: string;
    Desc: string;
    Error: number;
    Result: string | null;
}

function convertISODate(str: string): number {
    return Date.parse(str);
}

function parse(ddoStr: string, version?: string): Ddo {
    let ontDdo: OntDdo;
    if (version === '80e7d2fc22c24c466f44c7688569cc6e6d6c6f92') {
        ontDdo = v1deserializeDDO(ddoStr);
    } else {
        ontDdo = v2deserializeDDO(ddoStr);
    }

    console.log('ddo', ontDdo);
    const Attributes: DdoAttribute[] = [];
    const Claims: DdoClaim[] = [];

    ontDdo.attributes.forEach(ontAtr => {
        Attributes.push({
            Id: ontAtr.path,
            Type: ontAtr.type,
            Value: ontAtr.value
        });

        if (ontAtr.type.toLowerCase() === 'json') {
            const attrValue = JSON.parse(ontAtr.value);

            if (get(attrValue, 'Metadata') !== undefined) {

                const Issuer: string | null = get(attrValue, 'Metadata.Issuer', null);
                const TimestampStr: string | null = get(attrValue, 'Metadata.CreateTime', null);
                const ContentObj: object | null = get(attrValue, 'Content', null);

                const Timestamp: number | null = TimestampStr !== null ? convertISODate(TimestampStr) : null;
                const Content: string | null = ContentObj !== null ? JSON.stringify(ContentObj) : null;

                Claims.push({
                    Id: ontAtr.path,
                    Issuer,
                    Timestamp,
                    Content
                });
            }
        }
    });

    return {
        Attributes,
        Claims
    };
}

export async function getDdo(ontId: string, version?: string): Promise<Ddo> {
    
    let tx: Transaction;

    if (version === '80e7d2fc22c24c466f44c7688569cc6e6d6c6f92') {
        tx = v1buildGetDDOTx(ontId);
    } else {
        tx = v2buildGetDDOTx(ontId);
    }
    console.log(tx);
    console.log(tx.serialize());
    const client = new RestClient(CONST.TEST_ONT_URL.REST_URL);
    const response: DdoResponse = await (client.sendRawTransaction(tx.serialize(), true) as Promise<DdoResponse>);
    
    if (response.Result != null && response.Result.length > 0) {
        return parse(response.Result[0], version);
    } else {
        throw new Error('Cant fetch ddo.');
    }
}
