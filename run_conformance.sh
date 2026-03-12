#!/usr/bin/env bash
# Run the ACTIS conformance harness against actis-verifier-ts.
# Must be called from the actis-verifier-ts/ directory (or repo root with REPO_ROOT set).
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$SCRIPT_DIR/..}"
VECTORS_DIR="$REPO_ROOT/actis/test-vectors"
VERIFIER="$SCRIPT_DIR/dist/index.js"

if [ ! -f "$VERIFIER" ]; then
  echo "Verifier not built. Run: npm run build" >&2
  exit 1
fi
if [ ! -f "$VECTORS_DIR/run_conformance.sh" ]; then
  echo "Conformance harness not found at $VECTORS_DIR/run_conformance.sh" >&2
  exit 1
fi

ACTIS_VERIFIER_CMD="node $VERIFIER" bash "$VECTORS_DIR/run_conformance.sh"
