/**
 * Main verification pipeline.
 *
 * Runs all checks in order and assembles a VerificationReport.
 * Bundle security failures (path traversal, symlinks, duplicate entries) immediately
 * yield ACTIS_NONCOMPLIANT with all boolean fields false.
 */
import type { ActisStatus, IntegrityStatus } from "./status";
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
export declare function verifyBundle(zipPath: string): VerificationReport;
