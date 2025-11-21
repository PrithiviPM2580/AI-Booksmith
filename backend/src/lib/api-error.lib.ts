// ============================================================
// 🧩 APIErrorLib — API error handling library
// ============================================================

class APIError extends Error {
	public readonly statusCode: number; // HTTP status code
	public readonly success: boolean; // Indicates if the operation was successful
	public readonly error?: APIErrorType; // Detailed error information

	// ------------------------------------------------------
	// Constructor: Initializes a new APIError instance
	// ------------------------------------------------------
	constructor(
		statusCode: number = 500,
		message: string = "Internal Server Error",
		error?: APIErrorType,
		stack?: string,
	) {
		// Call the parent constructor
		super(message);
		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.success = false;
		this.error = error;

		// Capture stack trace if not provided
		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

export default APIError;
