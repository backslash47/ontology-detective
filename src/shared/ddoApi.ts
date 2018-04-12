import { get } from 'lodash';
import axios, { AxiosResponse } from 'axios';
import { TransactionBuilder, OntidContract, CONST, DDO as OntDdo } from 'ont-sdk-ts';
import { DdoAttribute, Ddo, DdoClaim } from './ont/model';

interface DdoResponse {
    Action: string;
    Desc: string;
    Error: number;
    Result: string | null;
}

function convertISODate(str: string): number {
    return Date.parse(str);
}

function parse(ddoStr: string): Ddo {
    const ontDdo = OntDdo.deserialize(ddoStr);
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

export async function getDdo(ontId: string): Promise<Ddo> {
    
    let tx = OntidContract.buildGetDDOTx(ontId);
    let param = TransactionBuilder.buildRestfulParam(tx);

    const url = TransactionBuilder.sendRawTxRestfulUrl(CONST.TEST_ONT_URL.REST_URL, true);
    
    const res: AxiosResponse = await axios.post<DdoResponse>(url, param);
    
    return parse(res.data.Result[0]);
}
