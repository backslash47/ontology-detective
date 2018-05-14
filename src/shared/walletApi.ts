import { 
    OntidContract, 
    WebsocketClient, 
    CONST, 
    Wallet, 
    Claim, 
    utils, 
    crypto,
    Account, 
    TransactionBuilder,
    Identity
} from 'ont-sdk-ts';
import { find } from 'lodash';

import PrivateKey = crypto.PrivateKey;
import Address = crypto.Address;

const client = new WebsocketClient(CONST.TEST_ONT_URL.SOCKET_URL);

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
                    identity.controls[0].encryptedKey.decrypt(password);
                } catch (e) {
                    throw new Error(Errors.WRONG_PASSWORD);        
                }
            }
        }

        const account = new Account();
        const privateKey = PrivateKey.random();
        account.create(privateKey, password, label);

        wallet.addAccount(account);
        if (wallet.defaultAccountAddress === '') {
            wallet.setDefaultAccount(account.address.toBase58());
        }

        saveWallet(wallet);

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
                    defIdentity.controls[0].encryptedKey.decrypt(password);
                } catch (e) {
                    throw new Error(Errors.WRONG_PASSWORD);        
                }
            }
        }

        const identity = new Identity();
        const privateKey = PrivateKey.random();
        identity.create(privateKey, password, label);

        wallet.addIdentity(identity);
        saveWallet(wallet);

        await registerIdentity(identity.ontid, privateKey);

        return identity;
    } else {
        throw new Error(Errors.NOT_SIGNED_IN);
    }
}

export async function transferAsset(
    fromStr: string, 
    toStr: string, 
    password: string, 
    amount: number
): Promise<void> {
    const wallet = loadWallet();

    const from = new Address(fromStr);
    const to = new Address(toStr);

    if (wallet !== null) {
        const account = find(wallet.accounts, a => a.address.equals(from));
        
        if (account !== undefined) {

            try {
                const privateKey = account.encryptedKey.decrypt(password);
 
                const tx = TransactionBuilder.makeTransferTransaction(
                    'ONT', 
                    from, 
                    to, 
                    amount.toString(), 
                    privateKey
                );
                await client.sendRawTransaction(tx.serialize(), false, true);

            } catch (e) {
                throw new Error(Errors.WRONG_PASSWORD);
            }
        } else {
            throw new Error(Errors.IDENTITY_NOT_FOUND);
        }
    } else {
        throw new Error(Errors.NOT_SIGNED_IN);
    }
}

export async function registerIdentity(ontId: string, privKey: PrivateKey): Promise<string> {
    const tx = OntidContract.buildRegisterOntidTx(ontId, privKey);
    await client.sendRawTransaction(tx.serialize(), false, true);

    return ontId;
}

export async function registerSelfClaim(
    ontId: string, 
    password: string, 
    context: string, 
    data: object
): Promise<string> {
    const wallet = loadWallet();
    const publicKeyId = ontId + '#keys-1';

    if (wallet !== null) {
        const identity = find(wallet.identities, ident => ident.ontid === ontId);
        
        if (identity !== undefined) {

            try {
                const privateKey = identity.controls[0].encryptedKey.decrypt(password);

                const metadata = {
                    issuer: ontId,
                    subject: ontId,
                    issuedAt: utils.now() 
                };
                const claim = new Claim(metadata, undefined, false);
                claim.context = context;
                claim.content = data;
                
                await claim.sign(CONST.TEST_ONT_URL.REST_URL, publicKeyId, privateKey);
                
                const type = utils.str2hexstr('Json');
                const value = utils.str2hexstr(JSON.stringify(claim));
        
                const tx = OntidContract.buildAddAttributeTx(
                    utils.str2hexstr('claim:' + claim.metadata.messageId), 
                    value, 
                    type, 
                    ontId, 
                    privateKey
                );
                await client.sendRawTransaction(tx.serialize(), false, true);
                
                return ontId;
            } catch (e) {
                throw new Error(Errors.WRONG_PASSWORD);
            }
        } else {
            throw new Error(Errors.IDENTITY_NOT_FOUND);
        }
    } else {
        throw new Error(Errors.NOT_SIGNED_IN);
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
        return wallet.accounts.map(a => a.address.toBase58()).includes(address);
    }

    return false;
}
