import type { RequestHandler } from "express";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import { getCurrentUser, loginUser, refreshAccessToken, registerUser } from "./auth.service.js";
import { AppError } from "../../common/errors/AppError.js";
import { logoutSession } from "./refreshToken.service.js";

export const registerController: RequestHandler = async (req, res) => {
    const data = req.body as RegisterInput;

    const user = await registerUser(data);

    return res.status(201).json({
        data: user,
    });
}

export const loginController: RequestHandler = async (req, res) => {
    const data = req.body as LoginInput;

    const { refreshToken, ...responseData } = await loginUser(data);

    res.cookie("refreshToken", refreshToken, {httpOnly: true, secure: false, sameSite: "lax", maxAge: 30 * 24 * 60 * 60 * 1000, path: "/api/auth"});

    return res.status(200).json({
        data: responseData,
    });
}

export const getCurrentUserController: RequestHandler = async (_req, res) => {
    const userId = res.locals.userId;

    const user = await getCurrentUser(userId);

    return res.status(200).json({
        data: user,
    })
}

export const refreshController: RequestHandler = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError({ message: "Invalid refresh token", statusCode: 401, code: "INVALID_REFRESH_TOKEN" });
    }

    const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken);

    res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 30 * 24 * 60 * 60 * 1000, path: "/api/auth"});

    return res.status(200).json({
        data: {
            accessToken,
        },
    });
}

export const logoutController: RequestHandler = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        await logoutSession(refreshToken);
    }

    res.clearCookie("refreshToken", { httpOnly: true, secure: false, sameSite: "lax", path: "/api/auth" });

    return res.status(204).send();
}