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
type JsonValue = null | boolean | number | string | JsonValue[] | {
    [key: string]: JsonValue;
};
export interface HashChainResult {
    hashChainOk: boolean;
    replayOk: boolean;
    errors: string[];
}
export declare function verifyHashChain(transcript: Record<string, JsonValue>, opts?: {
    skipFinalHash?: boolean;
}): HashChainResult;
export {};
