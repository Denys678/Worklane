import { AppError } from "../../common/errors/AppError.js";
import { generateRefreshToken, hashRefreshToken } from "../../common/utils/refreshToken.js";
import prisma from "../../lib/prisma.js";

export async function createRefreshSession(userId: string): Promise<string> {
    const rawToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawToken);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
        data: {
            tokenHash,
            userId,
            expiresAt,
        }
    });

    return rawToken;
}

export async function refreshSession(rawToken: string): Promise<string> {
    const tokenHash = hashRefreshToken(rawToken);

    const currentRefreshToken = await prisma.refreshToken.findUnique({
        where: {
            tokenHash,
        },
        select: {
            userId: true,
            expiresAt: true,
        }
    });

    if (!currentRefreshToken) {
        throw new AppError({message: "Invalid refresh token", statusCode: 401, code: "INVALID_REFRESH_TOKEN"});
    }

    if (currentRefreshToken.expiresAt <= new Date()) {
        await prisma.refreshToken.delete({
            where: {
                tokenHash,
            }
        });

        throw new AppError({message: "Invalid refresh token", statusCode: 401, code: "INVALID_REFRESH_TOKEN"});
    }

    return currentRefreshToken.userId;
}

export async function logoutSession(rawToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(rawToken);

    await prisma.refreshToken.deleteMany({
        where: {
            tokenHash,
        },
    });
}