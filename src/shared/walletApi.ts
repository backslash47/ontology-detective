import { OntidContract, WebSocketClientApi, CONST, Wallet, Metadata, Claim, utils, scrypt } from 'ont-sdk-ts';
import { get, find } from 'lodash';
import TxSender from './txSender';

const builder = new WebSocketClientApi();

export enum Errors {
    NOT_SIGNED_IN = 'Not signed in',
    IDENTITY_NOT_FOUND = 'Identity not found',
    WRONG_PASSWORD = 'Wrong password'
}

export async function registerIdentity(ontId: string, privKey: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const tx = OntidContract.buildRegisterOntidTx(ontId, privKey);
        const raw = builder.sendRawTransaction(tx.serialize());

        const txSender = new TxSender(CONST.TEST_ONT_URL.SOCKET_URL);
        txSender.sendTxWithSocket(raw, (err, res, socket) => {
            
            if (err !== null) {
                reject(err);
            } else if (
                get(res, 'Action') === 'InvokeTransaction' && 
                get(res, 'Desc') === 'SUCCESS' &&
                socket !== null
            ) {
                socket.close();
                resolve(ontId);
            }
        });
    }); 
}

export async function registerSelfClaim(
    ontId: string, 
    password: string, 
    context: string, 
    data: object
): Promise<string> {
    const wallet = loadWallet();

    if (wallet !== null) {
        const identity = find(wallet.identities, ident => ident.ontid === ontId);
        
        if (identity !== undefined) {

            try {
                const encryptedPrivateKey = identity.controls[0].key;
                const privateKey = scrypt.decrypt(encryptedPrivateKey, password);

                return new Promise<string>((resolve, reject) => {
                    let date = (new Date()).toISOString();
                    if (date.indexOf('.') > -1) {
                        date = date.substring(0, date.indexOf('.')) + 'Z';
                    }
                    
                    const metadata = new Metadata();
                    metadata.CreateTime = date;
                    metadata.Issuer = ontId;
                    metadata.Subject = ontId;
                    
                    const claim = new Claim(context, data, metadata);
                    claim.sign(privateKey);
                    
                    const type = utils.str2hexstr('Json');
                    const value = utils.str2hexstr(JSON.stringify(claim));
            
                    const tx = OntidContract.buildAddAttributeTx(
                        utils.str2hexstr('claim:' + claim.Id), 
                        value, 
                        type, 
                        ontId, 
                        privateKey
                    );
                    const raw = builder.sendRawTransaction(tx.serialize());
                    
                    const txSender = new TxSender(CONST.TEST_ONT_URL.SOCKET_URL);
                    txSender.sendTxWithSocket(raw, (err, res, socket) => {
                            
                        if (err !== null) {
                            reject(err);
                        } else if (
                            get(res, 'Action') === 'InvokeTransaction' && 
                            get(res, 'Desc') === 'SUCCESS' &&
                            socket !== null
                        ) {
                            socket.close();
                            resolve(ontId);
                        }
                    });
                }); 
            } catch (e) {
                return Promise.reject(Errors.WRONG_PASSWORD);        
            }
        } else {
            return Promise.reject(Errors.IDENTITY_NOT_FOUND);
        }
    } else {
        return Promise.reject(Errors.NOT_SIGNED_IN);
    }
}

export function saveWallet(wallet: Wallet | string): void {
    if (typeof wallet === 'string') {
        sessionStorage.setItem('wallet', wallet);
    } else {
        sessionStorage.setItem('wallet', wallet.toJson());
    }
}

export function clearWallet(): void {
    sessionStorage.removeItem('wallet');
}

export function loadWallet(): Wallet | null {
    const walletStr = sessionStorage.getItem('wallet');

    if (walletStr != null) {
        
        try {
            // try to parse wallet
            return Wallet.parseJson(walletStr);
        } catch (e) {
            console.log(e);
        }
    }

    return null;
}

export function isOwnIdentity(ontId: string): boolean {
    const wallet = loadWallet();

    if (wallet !== null) {
        return wallet.identities.map(i => i.ontid).includes(ontId);
    }

    return false;
}
