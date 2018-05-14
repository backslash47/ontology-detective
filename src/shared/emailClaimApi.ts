import axios from 'axios';
import { find } from 'lodash';
import { loadWallet, Errors } from './walletApi';
import { Request, CONST } from 'ont-sdk-ts';

export async function sendEmailClaimRequest(OntId: string, password: string, email: string): Promise<void> {
    const wallet = loadWallet();

    if (wallet !== null) {
        const identity = find(wallet.identities, i => i.ontid === OntId);
        
        if (identity !== undefined) {

            try {
                const encryptedPrivateKey = identity.controls[0].encryptedKey;
                const privateKey = encryptedPrivateKey.decrypt(password);
                const publicKeyId = OntId + '#keys-1';
                
                const metadata = {
                    issuer: OntId,
                    subject: 'did:ont:TA7h95FKNztHUB8ELCDauck9yXQ5oD1Cwr',
                    issuedAt: Math.floor(Date.now() / 1000)
                };
                const request = new Request(metadata, undefined);
                request.data = { email };
                await request.sign(CONST.TEST_ONT_URL.REST_URL, publicKeyId, privateKey);

                await axios.post('http://18.196.120.23:3000/email-request', request.serialize(), {
                    headers: {
                        'Content-Type': 'text/plain',
                    }
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
