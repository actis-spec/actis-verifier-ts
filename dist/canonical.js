"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalize = canonicalize;
exports.omitKeys = omitKeys;
function canonicalize(value) {
    if (value === null)
        return "null";
    if (typeof value === "boolean")
        return value ? "true" : "false";
    if (typeof value === "number") {
        if (!isFinite(value))
            throw new Error(`Non-finite number not allowed in JCS: ${value}`);
        return JSON.stringify(value);
    }
    if (typeof value === "string")
        return JSON.stringify(value);
    if (Array.isArray(value)) {
        return "[" + value.map(canonicalize).join(",") + "]";
    }
    // Object: sort keys lexicographically (Unicode code-point order).
    const keys = Object.keys(value).sort();
    const pairs = keys.map((k) => JSON.stringify(k) + ":" + canonicalize(value[k]));
    return "{" + pairs.join(",") + "}";
}
/**
 * Return a shallow copy of `obj` with the given top-level keys omitted.
 * Nested objects and arrays are not modified.
 */
function omitKeys(obj, keys) {
    const omit = new Set(keys);
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
        if (!omit.has(k))
            result[k] = v;
    }
    return result;
}
//# sourceMappingURL=canonical.js.map