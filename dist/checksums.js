"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyChecksums = verifyChecksums;
const crypto_1 = require("crypto");
const CHECKSUMS_FILE = "checksums.sha256";
function sha256hex(buf) {
    const h = (0, crypto_1.createHash)("sha256");
    if (typeof buf === "string") {
        h.update(buf, "utf8");
    }
    else {
        h.update(buf);
    }
    return h.digest("hex");
}
function parseLine(line) {
    const trimmed = line.trimEnd();
    if (trimmed.length < 66)
        return null;
    const hash = trimmed.slice(0, 64);
    const sep = trimmed.slice(64, 66);
    const path = trimmed.slice(66);
    if (sep !== "  ")
        return null;
    if (!/^[0-9a-f]{64}$/.test(hash))
        return null;
    if (path.length === 0)
        return null;
    return { hash, path };
}
function verifyChecksums(contents) {
    const errors = [];
    const expected = new Map(); // path -> expected SHA-256 hex
    for (const rawLine of contents.checksumsTxt.split("\n")) {
        const line = rawLine.trim();
        if (line.length === 0)
            continue;
        const parsed = parseLine(rawLine.trimEnd());
        if (!parsed) {
            errors.push(`Invalid checksum line: ${rawLine.trimEnd()}`);
            return { checksumsOk: false, errors };
        }
        if (parsed.path === CHECKSUMS_FILE) {
            errors.push("checksums.sha256 must not list itself");
            return { checksumsOk: false, errors };
        }
        expected.set(parsed.path.replace(/\\/g, "/"), parsed.hash);
    }
    for (const [path, expectedHash] of expected) {
        // Locate file bytes.
        let bytes = null;
        if (path === "input/transcript.json") {
            bytes = contents.transcriptJson;
        }
        else if (path === "manifest.json") {
            // manifest.json might be absent (tv-006).
            bytes = contents.manifestJson || null;
        }
        else {
            const buf = contents.fileBytes.get(path);
            bytes = buf ?? null;
        }
        if (bytes === null || (typeof bytes === "string" && bytes.length === 0 && path === "manifest.json")) {
            errors.push(`File not found in bundle: ${path}`);
            return { checksumsOk: false, errors };
        }
        const computed = sha256hex(bytes);
        if (computed !== expectedHash) {
            errors.push(`Checksum mismatch for ${path}: expected ${expectedHash}, got ${computed}`);
            return { checksumsOk: false, errors };
        }
    }
    return { checksumsOk: true, errors: [] };
}
//# sourceMappingURL=checksums.js.map