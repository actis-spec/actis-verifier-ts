#!/usr/bin/env node
/**
 * actis-verifier-ts CLI entry point.
 *
 * Usage:
 *   actis-verify-ts <path-to-bundle.zip>
 *
 * Outputs a single JSON object to stdout with the verification report.
 * Compatible with the ACTIS conformance harness (run_conformance.sh).
 */

import { verifyBundle } from "./verify";

const zipPath = process.argv[2];
if (!zipPath) {
  console.error("Usage: actis-verify-ts <bundle.zip>");
  process.exit(1);
}

const report = verifyBundle(zipPath);
console.log(JSON.stringify(report, null, 2));
