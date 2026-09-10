import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import { generateAccessToken } from "../../common/utils/jwt.js";
import { hashRefreshToken } from "../../common/utils/refreshToken.js";
import { createRefreshSession, refreshSession } from "./refreshToken.service.js";

export async function registerUser(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: input.email,
        }
    });

    if (existingUser) {
        throw new AppError({
            message: "User with this email already exists",
            statusCode: 409,
            code: "EMAIL_ALREADY_EXISTS",
        });
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            passwordHash,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        }
    });

    return user;
}

export async function loginUser(input: LoginInput) {
    const user = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
        select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            createdAt: true,
        }
    });

    if(!user) {
        throw new AppError({message: "Invalid email or password", statusCode: 401, code: "INVALID_CREDENTIALS"});
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if(!isPasswordValid){
        throw new AppError({message: "Invalid email or password", statusCode: 401, code: "INVALID_CREDENTIALS"});
    }

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await createRefreshSession(user.id);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
    }
}

export async function getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        }
    });

    if (!user){
        throw new AppError({message: "Authenticated user no longer exists", statusCode: 401, code: "USER_NOT_FOUND"});
    }

    return user;
}

export async function refreshAccessToken(rawToken: string) {
    const userId = await refreshSession(rawToken);

    const tokenHash = hashRefreshToken(rawToken);

    await prisma.refreshToken.delete({
        where: {
            tokenHash,
        },
    });

    const refreshToken = await createRefreshSession(userId);
    const accessToken = await generateAccessToken(userId);

    return {
        accessToken,
        refreshToken,
    };
}