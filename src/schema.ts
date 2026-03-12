/**
 * Structural schema validation for ACTIS transcripts.
 *
 * Performs minimal structural checks matching ACTIS_COMPATIBILITY.md §6 check (1):
 *  - transcript_version must be "actis-transcript/1.0"
 *  - Required top-level fields must be present
 *  - rounds must be a non-empty array
 *  - Each round must have the required fields
 *  - Each round's signature object must have the required fields
 */

const TRANSCRIPT_VERSION = "actis-transcript/1.0";

const REQUIRED_TRANSCRIPT_FIELDS = [
  "transcript_id",
  "intent_id",
  "intent_type",
  "created_at_ms",
  "policy_hash",
  "strategy_hash",
  "identity_snapshot_hash",
  "rounds",
] as const;

const REQUIRED_ROUND_FIELDS = [
  "round_number",
  "round_type",
  "message_hash",
  "envelope_hash",
  "signature",
  "timestamp_ms",
  "previous_round_hash",
] as const;

export interface SchemaResult {
  schemaOk: boolean;
  errors: string[];
}

export function validateSchema(transcriptJson: string): SchemaResult {
  const errors: string[] = [];

  // Parse JSON.
  let transcript: unknown;
  try {
    transcript = JSON.parse(transcriptJson);
  } catch {
    return { schemaOk: false, errors: ["Transcript is not valid JSON"] };
  }

  if (typeof transcript !== "object" || transcript === null || Array.isArray(transcript)) {
    return { schemaOk: false, errors: ["Transcript root must be a JSON object"] };
  }

  const t = transcript as Record<string, unknown>;

  // Check version first — fail fast if wrong.
  const version = t["transcript_version"];
  if (typeof version !== "string" || version !== TRANSCRIPT_VERSION) {
    return {
      schemaOk: false,
      errors: [
        `Invalid transcript_version: '${String(version)}'. Must be '${TRANSCRIPT_VERSION}'.`,
      ],
    };
  }

  // Check required top-level fields.
  for (const field of REQUIRED_TRANSCRIPT_FIELDS) {
    if (!(field in t)) errors.push(`Missing required field: ${field}`);
  }

  // Validate rounds array.
  const rounds = t["rounds"];
  if (!Array.isArray(rounds) || rounds.length === 0) {
    errors.push("rounds must be a non-empty array");
    return { schemaOk: false, errors };
  }

  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i];
    if (typeof round !== "object" || round === null || Array.isArray(round)) {
      errors.push(`Round ${i} must be an object`);
      continue;
    }
    const r = round as Record<string, unknown>;

    for (const field of REQUIRED_ROUND_FIELDS) {
      if (!(field in r)) errors.push(`Round ${i} missing required field: ${field}`);
    }

    // Check signature sub-object.
    const sig = r["signature"];
    if (typeof sig === "object" && sig !== null && !Array.isArray(sig)) {
      const s = sig as Record<string, unknown>;
      if (!("signer_public_key_b58" in s) || !("signature_b58" in s)) {
        errors.push(
          `Round ${i} signature missing signer_public_key_b58 or signature_b58`
        );
      }
    }
  }

  return { schemaOk: errors.length === 0, errors };
}
