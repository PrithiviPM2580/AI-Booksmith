// ============================================================
// 🧩 CookieLib — Handles cookie operations
// ============================================================
import type { CookieOptions, Request, Response } from "express";

// ------------------------------------------------------
// cookieLib{} — Handles cookie operations
// ------------------------------------------------------
const cookieLib = {
	// ------------------------------------------------------
	// getOptions() — Returns default cookie options
	// ------------------------------------------------------
	getOptions: (): CookieOptions => ({
		httpOnly: true, // Accessible only by the web server
		secure: process.env.NODE_ENV === "production", // Transmitted only over HTTPS in production
		sameSite: "lax", // Helps prevent CSRF attacks
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
	}),

	// ------------------------------------------------------
	// setCookie() — Sets a cookie on the response
	// ------------------------------------------------------
	setCookie: (
		res: Response,
		name: string,
		value: string,
		options: CookieOptions = {},
	) => {
		// Set the cookie with merged options
		res.cookie(name, value, { ...cookieLib.getOptions(), ...options });
	},

	// ------------------------------------------------------
	// getCookie() — Retrieves a cookie from the request
	// ------------------------------------------------------
	getCookie: (req: Request, name: string) => {
		// Return the cookie value
		return req.cookies?.[name];
	},

	// ------------------------------------------------------
	// clearCookie() — Clears a cookie from the response
	// ------------------------------------------------------
	clearCookie: (res: Response, name: string, options: CookieOptions = {}) => {
		// Clear the cookie with merged options
		res.clearCookie(name, { ...cookieLib.getOptions(), ...options });
	},
};

export default cookieLib;
