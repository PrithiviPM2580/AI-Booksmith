// ============================================================
// 🧩 Types — Type definitions
// ============================================================

import { TokenDocument } from "@/models/token.model.ts";
import { UserDocument } from "@/models/user.model.ts";
import type { Request, Response } from "express";

// ------------------------------------------------------
// Global{} — Extend the global namespace
// ------------------------------------------------------
declare global {
	type APIErrorDetail = {
		field?: string;
		message?: string;
	};

	type APIErrorInfo = {
		type: string;
		details?: ErrorDetail[];
	};

	type APIErrorType = string | ErrorInfo;

	interface LogOptions {
		req: Request;
		res?: Response;
		message?: string;
		data?: unknown;
		error?: unknown;
		label?: string;
	}

	type RequestValidate = {
		body?: ZodTypeAny;
		query?: ZodTypeAny;
		params?: ZodTypeAny;
	};

	type Role = "admin" | "editor" | "author" | "user";

	type TokenPayload = {
		userId: string;
		role: "admin" | "editor" | "author" | "user";
	};

	type CreateUser = Pick<
		UserDocument,
		"_id" | "username" | "email" | "password" | "role"
	>;

	type CreateToken = Pick<
		TokenDocument,
		"_id" | "userId" | "token" | "userAgent" | "ip" | "expiresAt"
	>;
}
