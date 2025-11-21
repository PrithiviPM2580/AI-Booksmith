// ============================================================
// 🧩 AsyncHandlerMiddleware — Handles async controller errors
// ============================================================
import type { NextFunction, Request, Response } from "express";

// ------------------------------------------------------
// asyncHandlerMiddleware() — Handles async controller errors
// ------------------------------------------------------
const asyncHandlerMiddleware =
	(
		controller: (
			req: Request,
			res: Response,
			next: NextFunction,
		) => Promise<void>,
	) =>
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			//  Invoke the async controller
			await controller(req, res, next);
		} catch (error) {
			//  Pass any errors to the next middleware
			next(error);
		}
	};

export default asyncHandlerMiddleware;
