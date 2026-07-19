export declare const DUMMY_HASH: string
export declare function normalizeEmail(email: string): string
export declare function userIdForEmail(email: string): string
export declare function hashPassword(password: string): Promise<string>
export declare function matchesHash(password: string, storedHash: string): Promise<boolean>
