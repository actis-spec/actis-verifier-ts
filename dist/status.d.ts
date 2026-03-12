/**
 * actis_status decision tree per ACTIS_COMPATIBILITY.md §6.
 *
 *  ACTIS_COMPATIBLE   — schema_ok ∧ hash_chain_ok ∧ checksums_ok ∧ signatures_ok
 *  ACTIS_PARTIAL      — schema_ok ∧ hash_chain_ok ∧ checksums_ok ∧ ¬signatures_ok
 *  ACTIS_NONCOMPLIANT — any of schema_ok, hash_chain_ok, checksums_ok fail
 */
export type ActisStatus = "ACTIS_COMPATIBLE" | "ACTIS_PARTIAL" | "ACTIS_NONCOMPLIANT";
export type IntegrityStatus = "VALID" | "INDETERMINATE" | "TAMPERED";
export interface StatusInput {
    schemaOk: boolean;
    hashChainOk: boolean;
    checksumsOk: boolean;
    signaturesOk: boolean;
}
export declare function deriveStatus(input: StatusInput): {
    actisStatus: ActisStatus;
    integrityStatus: IntegrityStatus;
};
