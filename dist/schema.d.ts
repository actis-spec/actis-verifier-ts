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
export interface SchemaResult {
    schemaOk: boolean;
    errors: string[];
}
export declare function validateSchema(transcriptJson: string): SchemaResult;
