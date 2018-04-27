import { 
    OntidContract, 
    WebSocketClientApi, 
    CONST, 
    Wallet, 
    Metadata, 
    Claim, 
    utils, 
    scrypt, 
    Account, 
    core, 
    TransactionBuilder,
    Identity
} from 'ont-sdk-ts';
import { get, find } from 'lodash';
import TxSender from './txSender';

const builder = new WebSocketClientApi();

export enum Errors {
    NOT_SIGNED_IN = 'Not signed in',
    IDENTITY_NOT_FOUND = 'Identity not found',
    WRONG_PASSWORD = 'Wrong password'
}

export function createAccount(label: string, password: string): Account {
    const wallet = loadWallet();

    if (wallet !== null) {
        // check password
        if (wallet.defaultOntid !== undefined) {
            const identity = find(wallet.identities, ident => ident.ontid === wallet.defaultOntid);

            if (identity !== undefined) {
                try {
                    const encryptedPrivateKey = identity.controls[0].key;
                    scrypt.decrypt(encryptedPrivateKey, password);
                } catch (e) {
                    throw new Error(Errors.WRONG_PASSWORD);        
                }
            }
        }

        const account = new Account();
        const privateKey = core.generatePrivateKeyStr();
        account.create(privateKey, password, label);

        wallet.addAccount(account);
        if (wallet.defaultAccountAddress === '') {
            wallet.setDefaultAccount(account.address);
        }

        saveWallet(wallet.toJson());

        return account;
    } else {
        throw new Error(Errors.NOT_SIGNED_IN);
    }
}

export async function createIdentity(label: string, password: string): Promise<Identity> {
    const wallet = loadWallet();

    if (wallet !== null) {
        // check password
        if (wallet.defaultOntid !== undefined) {
            const defIdentity = find(wallet.identities, ident => ident.ontid === wallet.defaultOntid);

            if (defIdentity !== undefined) {
                try {
                    const encryptedPrivateKey = defIdentity.controls[0].key;
                    scrypt.decrypt(encryptedPrivateKey, password);
                } catch (e) {
                    throw new Error(Errors.WRONG_PASSWORD);        
                }
            }
        }

        const identity = new Identity();
        const privateKey = core.generatePrivateKeyStr();
        identity.create(privateKey, password, label);

        wallet.addIdentity(identity);

        saveWallet(wallet.toJson());

        await registerIdentity(identity.ontid, privateKey);

        return identity;
    } else {
        throw new Error(Errors.NOT_SIGNED_IN);
    }
}

export async function transferAsset(
    from: string, 
    to: string, 
    password: string, 
    amount: number
): Promise<void> {
    const wallet = loadWallet();

    if (wallet !== null) {
        const account = find(wallet.accounts, a => a.address === from);
        
        if (account !== undefined) {

            try {
                const encryptedPrivateKey = account.key;
                const privateKey = scrypt.decrypt(encryptedPrivateKey, password);

                return new Promise<void>((resolve, reject) => {
                    const tx = TransactionBuilder.makeTransferTransaction(
                        'ONT', 
                        core.addressToU160(from), 
                        core.addressToU160(to), 
                        amount.toString(), 
                        privateKey
                    );
                    const raw = builder.sendRawTransaction(tx.serialize());
                    
                    const txSender = new TxSender(CONST.TEST_ONT_URL.SOCKET_URL);
                    txSender.sendTxWithSocket(raw, (err, res, socket) => {     
                        if (err !== null) {
                            reject(err);
                        } else if (
                            get(res, 'Action') === 'Notify' && 
                            get(res, 'Desc') === 'SUCCESS' &&
                            socket !== null
                        ) {
                            socket.close();
                            resolve();
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

export async function registerIdentity(ontId: string, privKey: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const tx = OntidContract.buildRegisterOntidTx(ontId, privKey);
        const raw = builder.sendRawTransaction(tx.serialize());

        const txSender = new TxSender(CONST.TEST_ONT_URL.SOCKET_URL);
        txSender.sendTxWithSocket(raw, (err, res, socket) => {
            
            if (err !== null) {
                reject(err);
            } else if (
                get(res, 'Action') === 'Notify' && 
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
                            get(res, 'Action') === 'Notify' && 
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

export function isOwnAccount(address: string): boolean {
    const wallet = loadWallet();

    if (wallet !== null) {
        return wallet.accounts.map(a => a.address).includes(address);
    }

    return false;
}
