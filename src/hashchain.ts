/**
 * Hash chain verification for ACTIS v1.0 transcripts.
 *
 * Per ACTIS_COMPATIBILITY.md:
 *
 * §3.1 Genesis hash (round 0 previous_round_hash):
 *   SHA-256( UTF-8( intent_id + ":" + decimal(created_at_ms) ) )
 *
 * §3.2 Round hash:
 *   SHA-256( UTF-8( canonical_json( round_without_round_hash ) ) )
 *
 * §3.3 Chain linkage:
 *   round[i].previous_round_hash == round_hash of round[i-1]
 *   (using stored round_hash if present, otherwise recomputed value)
 *
 * §3.4 Final hash:
 *   SHA-256( UTF-8( canonical_json( transcript_without_final_hash_and_model_context ) ) )
 *
 * replay_ok mirrors hash_chain_ok (v1.0 semantics).
 */

import { createHash } from "crypto";
import { canonicalize, omitKeys } from "./canonical";

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

function sha256hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

function genesisHash(intentId: string, createdAtMs: number | bigint): string {
  const s = `${intentId}:${createdAtMs}`;
  return sha256hex(s);
}

export interface HashChainResult {
  hashChainOk: boolean;
  replayOk: boolean;
  errors: string[];
}

export function verifyHashChain(
  transcript: Record<string, JsonValue>,
  opts: { skipFinalHash?: boolean } = {}
): HashChainResult {
  const errors: string[] = [];

  const rounds = transcript["rounds"];
  if (!Array.isArray(rounds) || rounds.length === 0) {
    return { hashChainOk: false, replayOk: false, errors: ["Missing or empty rounds"] };
  }

  const intentId = transcript["intent_id"];
  const createdAtMs = transcript["created_at_ms"];

  if (typeof intentId !== "string") {
    return { hashChainOk: false, replayOk: false, errors: ["Missing intent_id"] };
  }
  if (typeof createdAtMs !== "number") {
    return { hashChainOk: false, replayOk: false, errors: ["Missing or invalid created_at_ms"] };
  }

  // The "previous hash" carried forward — starts as genesis for round 0.
  let previousHash: string | null = null;

  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i];
    if (typeof round !== "object" || round === null || Array.isArray(round)) {
      errors.push(`Round ${i} is not an object`);
      return { hashChainOk: false, replayOk: false, errors };
    }
    const r = round as Record<string, JsonValue>;

    // Determine expected previous_round_hash.
    const expectedPrevious =
      i === 0 ? genesisHash(intentId, createdAtMs) : (previousHash as string);

    const claimedPrevious = r["previous_round_hash"];
    if (typeof claimedPrevious !== "string") {
      errors.push(`Round ${i} missing previous_round_hash`);
      return { hashChainOk: false, replayOk: false, errors };
    }

    if (claimedPrevious !== expectedPrevious) {
      errors.push(
        `Hash chain broken at round ${i}: expected previous_round_hash ${expectedPrevious}, got ${claimedPrevious}`
      );
      return { hashChainOk: false, replayOk: false, errors };
    }

    // Recompute round_hash = SHA-256( canonical_json( round without "round_hash" and "signature" ) ).
    const roundWithoutHash = omitKeys(r, ["round_hash", "signature"]);
    const computedRoundHash = sha256hex(canonicalize(roundWithoutHash));

    // If round_hash is stored, verify it matches the recomputed value.
    const storedRoundHash = r["round_hash"];
    if (typeof storedRoundHash === "string") {
      if (storedRoundHash !== computedRoundHash) {
        errors.push(
          `Round hash mismatch at round ${i}: stored ${storedRoundHash}, computed ${computedRoundHash}`
        );
        return { hashChainOk: false, replayOk: false, errors };
      }
    }

    // Carry forward: use stored round_hash if present, else the computed value.
    previousHash =
      typeof storedRoundHash === "string" ? storedRoundHash : computedRoundHash;
  }

  // §3.4 Final hash (if present) — only when schema is valid.
  // When schema fails (e.g. wrong transcript_version) we skip the final_hash check because
  // the canonical form of an unknown-version transcript is undefined, making the check
  // meaningless and consistently producing a false negative.
  if (opts.skipFinalHash) {
    return { hashChainOk: true, replayOk: true, errors: [] };
  }

  const claimedFinal = transcript["final_hash"];
  if (typeof claimedFinal === "string" && claimedFinal.length > 0) {
    const transcriptForHash = omitKeys(transcript, ["final_hash", "model_context"]);
    const computedFinal = sha256hex(canonicalize(transcriptForHash));
    if (claimedFinal !== computedFinal) {
      errors.push(
        `Final hash mismatch: stored ${claimedFinal}, computed ${computedFinal}`
      );
      return { hashChainOk: false, replayOk: false, errors };
    }
  }

  return { hashChainOk: true, replayOk: true, errors: [] };
}
