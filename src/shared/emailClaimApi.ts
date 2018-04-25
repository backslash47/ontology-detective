import axios from 'axios';
import { find } from 'lodash';
import { loadWallet, Errors } from './walletApi';
import { scrypt, WebRequest } from 'ont-sdk-ts';

export class EmailRequest extends WebRequest {
    email: string;

    constructor(OntId: string, email: string) {
        super(OntId);

        this.email = email;
    }
}

export async function sendEmailClaimRequest(OntId: string, password: string, email: string): Promise<void> {
    const wallet = loadWallet();

    if (wallet !== null) {
        const identity = find(wallet.identities, i => i.ontid === OntId);
        
        if (identity !== undefined) {

            try {
                const encryptedPrivateKey = identity.controls[0].key;
                const privateKey = scrypt.decrypt(encryptedPrivateKey, password);
                
                const request = new EmailRequest(OntId, email);
                request.sign(privateKey);

                await axios.post('http://localhost:8080/email-request', request);
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
