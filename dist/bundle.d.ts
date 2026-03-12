/**
 * Bundle reading: open a ZIP, enforce ACTIS bundle-security rules, return contents.
 *
 * Security rules (ACTIS_COMPATIBILITY.md §5):
 *  - No path traversal (../ segments).
 *  - No absolute paths or drive-letter paths.
 *  - No symlinks for core paths.
 *  - No duplicate archive entries for the same normalized path.
 */
export interface BundleContents {
    transcriptJson: string;
    manifestJson: string;
    checksumsTxt: string;
    /** All file paths → raw bytes, used for checksum verification. */
    fileBytes: Map<string, Buffer>;
}
export interface BundleSecurityError {
    kind: "security";
    message: string;
}
export interface BundleMissingError {
    kind: "missing";
    message: string;
}
export type BundleError = BundleSecurityError | BundleMissingError;
export declare function readBundle(zipPath: string): BundleContents | BundleError;
