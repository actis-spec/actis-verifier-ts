/**
 * RFC 8785 JSON Canonicalization Scheme (JCS) implementation.
 *
 * Rules:
 *  - Object keys sorted lexicographically (Unicode code-point order, same as JS default sort).
 *  - No whitespace between tokens.
 *  - Strings use standard JSON escaping (JSON.stringify is correct).
 *  - Numbers use JavaScript's JSON.stringify serialization, which matches RFC 8785 §3.2.2 for
 *    the finite doubles present in ACTIS transcripts (integers stay integral, floats use the
 *    shortest round-trip representation, e.g. 0.00005 not 5e-5).
 *  - null / boolean use their JSON literals.
 */
type JsonValue = null | boolean | number | string | JsonValue[] | {
    [key: string]: JsonValue;
};
export declare function canonicalize(value: JsonValue): string;
/**
 * Return a shallow copy of `obj` with the given top-level keys omitted.
 * Nested objects and arrays are not modified.
 */
export declare function omitKeys(obj: Record<string, JsonValue>, keys: string[]): Record<string, JsonValue>;
export {};
