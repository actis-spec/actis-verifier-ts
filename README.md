---
# actis-verifier-ts

Independent TypeScript implementation of the ACTIS v1.0 verifier.

**Conformance:** 11/11 corpus vectors (tv-001–tv-011)
**Standard:** [ACTIS v1.0](../actis/docs/ACTIS_COMPATIBILITY.md)
**Language:** TypeScript / Node.js

---

## Usage
```bash
npm install
npm run build
node dist/index.js path/to/bundle.zip
```

Output is a single JSON verification report on stdout.
```bash
# Run full conformance corpus
./run_conformance.sh
```

---

## Verification report
```json
{
  "actis_version": "1.0",
  "actis_status": "ACTIS_COMPATIBLE",
  "integrity_status": "VALID",
  "schema_ok": true,
  "hash_chain_ok": true,
  "signatures_ok": true,
  "checksums_ok": true,
  "replay_ok": true,
  "warnings": [],
  "errors": []
}
```

Exit code: `0` for ACTIS_COMPATIBLE or ACTIS_PARTIAL, `1` for ACTIS_NONCOMPLIANT.

---

## Design

All hash formulas derived directly from [ACTIS_COMPATIBILITY.md](../actis/docs/ACTIS_COMPATIBILITY.md). No code shared with actis-verifier-rust.

| Check | Implementation |
|---|---|
| Schema | Required fields, transcript_version, round fields, signature fields |
| Hash chain | Genesis hash, round_hash (excludes round_hash + signature keys), final_hash |
| Signatures | Ed25519 over hex-decoded envelope_hash bytes; Base58 keys and signatures |
| Checksums | SHA-256 of each listed file vs stored hash |
| Replay | Independent final_hash recomputation from scratch |
| Bundle security | Path traversal rejection, duplicate entry detection, missing manifest detection |

**Key:** `round_hash` excludes both `round_hash` and `signature` keys per §3.2. This ensures `hash_chain_ok` is independent of signature verification.

---

## Canonicalization

RFC 8785 (JCS): keys sorted lexicographically by UTF-16 code-unit order (matches ASCII lexicographic order for all normative ACTIS keys). Numbers serialized via `JSON.stringify` — correctly produces `0.00005` not `5e-5`.

---

## Dependencies

- `@noble/curves` — Ed25519 verification
- `adm-zip` — ZIP bundle extraction  
- `bs58` — Base58 decode for keys and signatures

---

*This implementation is independent of actis-verifier-rust. Both must pass the same conformance corpus.*
---
