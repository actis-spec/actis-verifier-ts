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

export function deriveStatus(input: StatusInput): {
  actisStatus: ActisStatus;
  integrityStatus: IntegrityStatus;
} {
  let actisStatus: ActisStatus;

  if (!input.schemaOk || !input.hashChainOk || !input.checksumsOk) {
    actisStatus = "ACTIS_NONCOMPLIANT";
  } else if (input.signaturesOk) {
    actisStatus = "ACTIS_COMPATIBLE";
  } else {
    actisStatus = "ACTIS_PARTIAL";
  }

  const integrityStatus: IntegrityStatus =
    actisStatus === "ACTIS_COMPATIBLE"
      ? "VALID"
      : actisStatus === "ACTIS_PARTIAL"
      ? "INDETERMINATE"
      : "TAMPERED";

  return { actisStatus, integrityStatus };
}
