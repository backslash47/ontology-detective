import { utils, DDO, DDOAttribute, crypto } from 'ont-sdk-ts';

const { StringReader } = utils;

export default function(hexstr: string) {
    const ss = new StringReader(hexstr);
    let ddo = new DDO();
    // total length of public keys - 4 bytes
    const pkTotalLen = parseInt(ss.read(4), 16);
    if (pkTotalLen > 0) {
        const pkNum = parseInt(ss.read(1), 16);
        for (let i = 0; i < pkNum; i++) {
            // length of public key - 4 bytes
            let pkLen = parseInt(ss.read(4), 16);
            let pubKey = new crypto.PublicKey();
            const rawPk = ss.read(pkLen);
            const type = parseInt(rawPk.substr(0, 2), 16);
            const curve = parseInt(rawPk.substr(2, 2), 16);
            const pk = rawPk.substr(4);
            pubKey.algorithm = type;
            pubKey.curve = curve;
            pubKey.pk = pk;
            ddo.publicKeys.push(pubKey);
        }
    }

    // attribute number - 4bytes
    const attrTotalLen = parseInt(ss.read(4), 16);
    if (attrTotalLen > 0) {
        const attrNum = parseInt(ss.read(1), 16);
        for (let i = 0; i < attrNum; i++) {
            parseInt(ss.read(4), 16); // const totalLen

            let attr = new DDOAttribute();
            const pathLen = parseInt(ss.read(4), 16);
            attr.path = utils.hexstr2str(ss.read(pathLen));

            const typeValueLen = parseInt(ss.read(4), 16);
            const typeLen = parseInt(ss.read(1), 16);
            attr.type = utils.hexstr2str(ss.read(typeLen));

            const valueLen = typeValueLen - typeLen - 1;
            attr.value = utils.hexstr2str(ss.read(valueLen));
            ddo.attributes.push(attr);
        }
    }
    
    return ddo;
}
