"use strict";
/**
 * Main verification pipeline.
 *
 * Runs all checks in order and assembles a VerificationReport.
 * Bundle security failures (path traversal, symlinks, duplicate entries) immediately
 * yield ACTIS_NONCOMPLIANT with all boolean fields false.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyBundle = verifyBundle;
const bundle_1 = require("./bundle");
const schema_1 = require("./schema");
const hashchain_1 = require("./hashchain");
const signatures_1 = require("./signatures");
const checksums_1 = require("./checksums");
const status_1 = require("./status");
function allFailReport(warnings) {
    return {
        actis_version: "1.0",
        actis_status: "ACTIS_NONCOMPLIANT",
        integrity_status: "TAMPERED",
        schema_ok: false,
        hash_chain_ok: false,
        signatures_ok: false,
        replay_ok: false,
        checksums_ok: false,
        warnings,
    };
}
function verifyBundle(zipPath) {
    // Step 1: read and security-check the bundle.
    const bundle = (0, bundle_1.readBundle)(zipPath);
    if ("kind" in bundle) {
        return allFailReport([bundle.message]);
    }
    // Parse transcript JSON.
    let transcript;
    try {
        const parsed = JSON.parse(bundle.transcriptJson);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            return allFailReport(["Transcript root is not a JSON object"]);
        }
        transcript = parsed;
    }
    catch (e) {
        return allFailReport([`Transcript JSON parse error: ${e.message}`]);
    }
    // Step 2: structural schema validation.
    const schemaResult = (0, schema_1.validateSchema)(bundle.transcriptJson);
    // Step 3: hash chain verification.
    // Skip final_hash when schema is invalid: the canonical form of an unknown-version transcript
    // is undefined, so the final_hash check would produce a spurious failure.
    const hashResult = (0, hashchain_1.verifyHashChain)(transcript, { skipFinalHash: !schemaResult.schemaOk });
    // Step 4: signature verification.
    const sigResult = (0, signatures_1.verifySignatures)(transcript);
    // Step 5: checksum verification.
    const checksumResult = (0, checksums_1.verifyChecksums)(bundle);
    // Derive status.
    const { actisStatus, integrityStatus } = (0, status_1.deriveStatus)({
        schemaOk: schemaResult.schemaOk,
        hashChainOk: hashResult.hashChainOk,
        checksumsOk: checksumResult.checksumsOk,
        signaturesOk: sigResult.signaturesOk,
    });
    // Collect warnings.
    const warnings = [
        ...schemaResult.errors,
        ...hashResult.errors,
        ...sigResult.errors,
        ...checksumResult.errors,
    ];
    return {
        actis_version: "1.0",
        actis_status: actisStatus,
        integrity_status: integrityStatus,
        schema_ok: schemaResult.schemaOk,
        hash_chain_ok: hashResult.hashChainOk,
        signatures_ok: sigResult.signaturesOk,
        replay_ok: hashResult.replayOk,
        checksums_ok: checksumResult.checksumsOk,
        warnings,
    };
}
//# sourceMappingURL=verify.js.map