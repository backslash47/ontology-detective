import { core, utils, AbiInfo, TransactionBuilder, Parameter, ParameterType, Transaction } from 'ont-sdk-ts';
import abiJson from './idContract.v2.abi';

const abiInfo = AbiInfo.parseJson(JSON.stringify(abiJson));

export function buildGetDDOTx(ontid: string): Transaction {
    if (ontid.substr(0, 3) === 'did') {
        ontid = utils.str2hexstr(ontid);
    }

    const nonce = utils.ab2hexstring(core.generateRandomArray(10));

    const f = abiInfo.getFunction('GetDDO');
    const p1 = new Parameter(f.parameters[0].getName(), ParameterType.ByteArray, ontid);
    const p2 = new Parameter(f.parameters[1].getName(), ParameterType.ByteArray, nonce);
    f.setParamsValue(p1, p2);

    return TransactionBuilder.makeInvokeTransaction(f, abiInfo.getHash());
}
