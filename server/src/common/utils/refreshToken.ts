import { randomBytes, createHash } from "node:crypto";

export function generateRefreshToken(): string {
    const randomRawToken = randomBytes(64).toString("hex");
    
    return randomRawToken;
}

export function hashRefreshToken(token: string): string {
    
    return createHash("sha256").update(token).digest("hex");
}