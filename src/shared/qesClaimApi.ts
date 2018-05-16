import axios from 'axios';
import { find } from 'lodash';
import { loadWallet, Errors } from './walletApi';
import { Request, CONST } from 'ont-sdk-ts';

export async function getChallengePdf(OntId: string, password: string): Promise<Blob> {
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
                request.data = { };
                await request.sign(CONST.TEST_ONT_URL.REST_URL, publicKeyId, privateKey);

                const response = await axios.post<Blob>('http://18.196.120.23:3001/generate', request.serialize(), {
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    responseType: 'blob'
                });
                return response.data;
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

export async function uploadSignedPdf(data: Blob): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', data);

    const response = await axios.post<Blob>('http://18.196.120.23:3001/validate', formData, {
        headers: {
            'Content-Type': 'text/plain',
        },
        responseType: 'blob'
    });
    return response.data;
}
