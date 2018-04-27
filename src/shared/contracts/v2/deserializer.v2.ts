import { DDO } from 'ont-sdk-ts';

export default function(hexstr: string) {
    return DDO.deserialize(hexstr);
}
