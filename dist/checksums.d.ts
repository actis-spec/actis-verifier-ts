/**
 * Checksum verification for ACTIS bundles.
 *
 * Per ACTIS_COMPATIBILITY.md §5:
 *  - checksums.sha256 format: "<64 lowercase hex>  <path>" (two spaces separator).
 *  - checksums.sha256 must NOT list itself.
 *  - All listed files must exist in the bundle and their SHA-256 must match.
 *
 * checksums_ok = true only when all listed files pass.
 */
import type { BundleContents } from "./bundle";
export interface ChecksumsResult {
    checksumsOk: boolean;
    errors: string[];
}
export declare function verifyChecksums(contents: BundleContents): ChecksumsResult;
