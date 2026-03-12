"use strict";
/**
 * actis_status decision tree per ACTIS_COMPATIBILITY.md §6.
 *
 *  ACTIS_COMPATIBLE   — schema_ok ∧ hash_chain_ok ∧ checksums_ok ∧ signatures_ok
 *  ACTIS_PARTIAL      — schema_ok ∧ hash_chain_ok ∧ checksums_ok ∧ ¬signatures_ok
 *  ACTIS_NONCOMPLIANT — any of schema_ok, hash_chain_ok, checksums_ok fail
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveStatus = deriveStatus;
function deriveStatus(input) {
    let actisStatus;
    if (!input.schemaOk || !input.hashChainOk || !input.checksumsOk) {
        actisStatus = "ACTIS_NONCOMPLIANT";
    }
    else if (input.signaturesOk) {
        actisStatus = "ACTIS_COMPATIBLE";
    }
    else {
        actisStatus = "ACTIS_PARTIAL";
    }
    const integrityStatus = actisStatus === "ACTIS_COMPATIBLE"
        ? "VALID"
        : actisStatus === "ACTIS_PARTIAL"
            ? "INDETERMINATE"
            : "TAMPERED";
    return { actisStatus, integrityStatus };
}
//# sourceMappingURL=status.js.map