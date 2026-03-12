/**
 * Ed25519 signature verification for ACTIS v1.0.
 *
 * Per ACTIS_COMPATIBILITY.md §4:
 *  - Scheme: Ed25519 only.
 *  - Message: stored envelope_hash decoded from 64 hex characters to 32 bytes.
 *  - Public key: Base58-decoded signer_public_key_b58 (32 bytes).
 *  - Signature: Base58-decoded signature_b58 (64 bytes).
 *
 * signatures_ok = true only when ALL rounds have a valid signature.
 */
type JsonValue = null | boolean | number | string | JsonValue[] | {
    [key: string]: JsonValue;
};
export interface SignaturesResult {
    signaturesOk: boolean;
    errors: string[];
}
export declare function verifySignatures(transcript: Record<string, JsonValue>): SignaturesResult;
export {};
