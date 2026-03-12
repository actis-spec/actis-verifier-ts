"use strict";
/**
 * Bundle reading: open a ZIP, enforce ACTIS bundle-security rules, return contents.
 *
 * Security rules (ACTIS_COMPATIBILITY.md §5):
 *  - No path traversal (../ segments).
 *  - No absolute paths or drive-letter paths.
 *  - No symlinks for core paths.
 *  - No duplicate archive entries for the same normalized path.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readBundle = readBundle;
const adm_zip_1 = __importDefault(require("adm-zip"));
const TRANSCRIPT_PATH = "input/transcript.json";
const MANIFEST_PATH = "manifest.json";
const CHECKSUMS_PATH = "checksums.sha256";
function normalizePath(name) {
    return name.replace(/\\/g, "/");
}
function validatePath(name) {
    const path = normalizePath(name);
    if (path.startsWith("/"))
        return { ok: false, error: `Absolute path not allowed: ${name}` };
    if (path.length >= 2 && path[1] === ":")
        return { ok: false, error: `Drive path not allowed: ${name}` };
    for (const segment of path.split("/")) {
        if (segment === "..")
            return { ok: false, error: `Path traversal not allowed: ${name}` };
    }
    return { ok: true, path };
}
// Unix file type constants for symlink detection.
const S_IFLNK = 0o120000;
const S_IFMT = 0o170000;
function readBundle(zipPath) {
    let zip;
    try {
        zip = new adm_zip_1.default(zipPath);
    }
    catch (e) {
        return { kind: "missing", message: `Cannot open ZIP: ${e.message}` };
    }
    const entries = zip.getEntries();
    const seen = new Set();
    let transcriptJson = "";
    let manifestJson = "";
    let checksumsTxt = "";
    const fileBytes = new Map();
    for (const entry of entries) {
        const rawName = entry.entryName;
        // Skip directory entries.
        if (rawName.endsWith("/"))
            continue;
        // Validate path.
        const validated = validatePath(rawName);
        if (!validated.ok)
            return { kind: "security", message: validated.error };
        const path = validated.path;
        // Reject duplicate paths.
        if (seen.has(path))
            return { kind: "security", message: `Duplicate path in archive: ${path}` };
        seen.add(path);
        // Reject symlinks (check Unix file attributes).
        const attr = entry.attr >>> 16; // top 16 bits are Unix mode
        if ((attr & S_IFMT) === S_IFLNK)
            return { kind: "security", message: `Symlink not allowed: ${path}` };
        const buf = entry.getData();
        const text = buf.toString("utf8");
        switch (path) {
            case TRANSCRIPT_PATH:
                transcriptJson = text;
                break;
            case MANIFEST_PATH:
                manifestJson = text;
                fileBytes.set(path, buf);
                break;
            case CHECKSUMS_PATH:
                checksumsTxt = text;
                break;
            default:
                fileBytes.set(path, buf);
        }
    }
    if (!transcriptJson)
        return { kind: "missing", message: `Required file missing: ${TRANSCRIPT_PATH}` };
    if (!manifestJson)
        return { kind: "missing", message: `Required file missing: ${MANIFEST_PATH}` };
    if (!checksumsTxt)
        return { kind: "missing", message: `Required file missing: ${CHECKSUMS_PATH}` };
    return { transcriptJson, manifestJson, checksumsTxt, fileBytes };
}
//# sourceMappingURL=bundle.js.map