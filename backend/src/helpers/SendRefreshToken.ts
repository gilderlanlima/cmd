import { CookieOptions, Response } from "express";

const buildRefreshTokenCookieOptions = (): CookieOptions => {
  const backendUrl = process.env.BACKEND_URL || "";
  const isSecure = backendUrl.startsWith("https://");

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    path: "/"
  };
};

export const getRefreshTokenCookieOptions = (): CookieOptions =>
  buildRefreshTokenCookieOptions();

export const SendRefreshToken = (res: Response, token: string): void => {
  res.cookie("jrt", token, buildRefreshTokenCookieOptions());
};
