// ============================================================
// 🧩 Server — Main server setup and configuration
// ============================================================

import app from "@/app.js";
import {
	connectToDatabase,
	gracefullyShutDownDatabase,
} from "@/config/database.config.js";
import config from "@/config/env.config.js";
import logger from "@/lib/logger.lib.js";

const PORT = config.PORT || 3001; // Define the port number

// ------------------------------------------------------
// startServer() — It starts the Express server
// ------------------------------------------------------
const startServer = async () => {
	try {
		// Connect to the database before starting the server
		await connectToDatabase();

		// Start the Express server
		const server = app.listen(PORT, () => {
			logger.info(`Server is running in the http://localhost:${PORT}`);
		});

		// Handle graceful shutdown on termination signals
		process.on("SIGINT", async () => gracefullyShutDownDatabase(server));

		// Handle graceful shutdown on termination signals
		process.on("SIGTERM", async () => gracefullyShutDownDatabase(server));
	} catch (error) {
		// Log any errors during server startup
		logger.error("Failed to start server", {
			label: "Server",
			error,
		});

		// Exit the process with failure code
		process.exit(1);
	}
};

export default startServer;
