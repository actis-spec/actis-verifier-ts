#!/usr/bin/env node
"use strict";
/**
 * actis-verifier-ts CLI entry point.
 *
 * Usage:
 *   actis-verify-ts <path-to-bundle.zip>
 *
 * Outputs a single JSON object to stdout with the verification report.
 * Compatible with the ACTIS conformance harness (run_conformance.sh).
 */
Object.defineProperty(exports, "__esModule", { value: true });
const verify_1 = require("./verify");
const zipPath = process.argv[2];
if (!zipPath) {
    console.error("Usage: actis-verify-ts <bundle.zip>");
    process.exit(1);
}
const report = (0, verify_1.verifyBundle)(zipPath);
console.log(JSON.stringify(report, null, 2));
//# sourceMappingURL=index.js.map