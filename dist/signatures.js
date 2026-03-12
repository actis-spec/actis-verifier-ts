"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignatures = verifySignatures;
const ed25519_1 = require("@noble/curves/ed25519");
const bs58_1 = __importDefault(require("bs58"));
function hexToBytes(hex) {
    if (hex.length !== 64 || !/^[0-9a-f]+$/.test(hex))
        return null;
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}
function verifySignatures(transcript) {
    const errors = [];
    const rounds = transcript["rounds"];
    if (!Array.isArray(rounds) || rounds.length === 0) {
        return { signaturesOk: false, errors: ["No rounds or empty rounds"] };
    }
    let validCount = 0;
    for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i];
        if (typeof round !== "object" || round === null || Array.isArray(round)) {
            errors.push(`Round ${i} is not an object`);
            continue;
        }
        const r = round;
        // Get stored envelope_hash; build 40-byte message: utf8("ACTIS/v1") || hex_decode(envelope_hash).
        const envelopeHash = r["envelope_hash"];
        if (typeof envelopeHash !== "string") {
            errors.push(`Round ${i} missing envelope_hash`);
            continue;
        }
        const domainBytes = new TextEncoder().encode("ACTIS/v1");
        const hashBytes = hexToBytes(envelopeHash.toLowerCase());
        if (!hashBytes) {
            errors.push(`Round ${i} invalid envelope_hash (must be 64 lowercase hex chars)`);
            continue;
        }
        const msgBytes = new Uint8Array(domainBytes.length + hashBytes.length);
        msgBytes.set(domainBytes, 0);
        msgBytes.set(hashBytes, domainBytes.length);
        // Get signature object.
        const sigObj = r["signature"];
        if (typeof sigObj !== "object" || sigObj === null || Array.isArray(sigObj)) {
            errors.push(`Round ${i} missing or invalid signature object`);
            continue;
        }
        const sig = sigObj;
        const pubKeyB58 = sig["signer_public_key_b58"];
        const sigB58 = sig["signature_b58"];
        if (typeof pubKeyB58 !== "string" || pubKeyB58.length === 0) {
            errors.push(`Round ${i} missing signer_public_key_b58`);
            continue;
        }
        if (typeof sigB58 !== "string" || sigB58.length === 0) {
            errors.push(`Round ${i} missing signature_b58`);
            continue;
        }
        // Decode Base58 public key and signature.
        let pubBytes;
        let sigBytes;
        try {
            pubBytes = bs58_1.default.decode(pubKeyB58);
        }
        catch {
            errors.push(`Round ${i} invalid Base58 public key`);
            continue;
        }
        try {
            sigBytes = bs58_1.default.decode(sigB58);
        }
        catch {
            errors.push(`Round ${i} invalid Base58 signature`);
            continue;
        }
        if (pubBytes.length !== 32) {
            errors.push(`Round ${i} public key must be 32 bytes, got ${pubBytes.length}`);
            continue;
        }
        if (sigBytes.length !== 64) {
            errors.push(`Round ${i} signature must be 64 bytes, got ${sigBytes.length}`);
            continue;
        }
        // Verify Ed25519 signature over the 40-byte domain-separated message.
        let valid;
        try {
            valid = ed25519_1.ed25519.verify(sigBytes, msgBytes, pubBytes);
        }
        catch {
            valid = false;
        }
        if (valid) {
            validCount++;
        }
        else {
            errors.push(`Round ${i} signature verification failed`);
        }
    }
    const signaturesOk = validCount > 0 && validCount === rounds.length;
    return { signaturesOk, errors };
}
//# sourceMappingURL=signatures.js.map