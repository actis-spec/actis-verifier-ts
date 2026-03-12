/**
 * Main verification pipeline.
 *
 * Runs all checks in order and assembles a VerificationReport.
 * Bundle security failures (path traversal, symlinks, duplicate entries) immediately
 * yield ACTIS_NONCOMPLIANT with all boolean fields false.
 */

import { readBundle } from "./bundle";
import { validateSchema } from "./schema";
import { verifyHashChain } from "./hashchain";
import { verifySignatures } from "./signatures";
import { verifyChecksums } from "./checksums";
import { deriveStatus } from "./status";
import type { ActisStatus, IntegrityStatus } from "./status";

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface VerificationReport {
  actis_version: string;
  actis_status: ActisStatus;
  integrity_status: IntegrityStatus;
  schema_ok: boolean;
  hash_chain_ok: boolean;
  signatures_ok: boolean;
  replay_ok: boolean;
  checksums_ok: boolean;
  warnings: string[];
}

function allFailReport(warnings: string[]): VerificationReport {
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

export function verifyBundle(zipPath: string): VerificationReport {
  // Step 1: read and security-check the bundle.
  const bundle = readBundle(zipPath);
  if ("kind" in bundle) {
    return allFailReport([bundle.message]);
  }

  // Parse transcript JSON.
  let transcript: Record<string, JsonValue>;
  try {
    const parsed = JSON.parse(bundle.transcriptJson);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return allFailReport(["Transcript root is not a JSON object"]);
    }
    transcript = parsed as Record<string, JsonValue>;
  } catch (e) {
    return allFailReport([`Transcript JSON parse error: ${(e as Error).message}`]);
  }

  // Step 2: structural schema validation.
  const schemaResult = validateSchema(bundle.transcriptJson);

  // Step 3: hash chain verification.
  // Skip final_hash when schema is invalid: the canonical form of an unknown-version transcript
  // is undefined, so the final_hash check would produce a spurious failure.
  const hashResult = verifyHashChain(transcript, { skipFinalHash: !schemaResult.schemaOk });

  // Step 4: signature verification.
  const sigResult = verifySignatures(transcript);

  // Step 5: checksum verification.
  const checksumResult = verifyChecksums(bundle);

  // Derive status.
  const { actisStatus, integrityStatus } = deriveStatus({
    schemaOk: schemaResult.schemaOk,
    hashChainOk: hashResult.hashChainOk,
    checksumsOk: checksumResult.checksumsOk,
    signaturesOk: sigResult.signaturesOk,
  });

  // Collect warnings.
  const warnings: string[] = [
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
