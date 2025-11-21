// ============================================================
// 🧩 ExpressTypes — Express.js custom type definitions
// ============================================================

declare global {
	namespace Express {
		interface Request {
			user?: TokenPayload;
		}
	}
}

export {};
