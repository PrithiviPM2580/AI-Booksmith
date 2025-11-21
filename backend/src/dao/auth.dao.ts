// ============================================================
// 🧩 AuthDao — Handles data access for authentication
// ============================================================

import TokenModel from "@/models/token.model.js";
import UserModel from "@/models/user.model.js";

// ------------------------------------------------------
// isUserExistsByEmail() — Checks if a user exists by email
// ------------------------------------------------------
export const isUserExistsByEmail = async (email: string): Promise<boolean> => {
	return Boolean(await UserModel.exists({ email }));
};

// ------------------------------------------------------
// createUser() — Creates a new user in the database
// ------------------------------------------------------
export const createUser = async (data: CreateUser) => {
	// Create and return the new user document
	return await UserModel.create(data);
};

// ------------------------------------------------------
// createToken() — Creates a new token in the database
// ------------------------------------------------------
export const createToken = async (data: CreateToken) => {
	// Create and return the new token document
	return await TokenModel.create(data);
};

// ------------------------------------------------------
// findUserByEmail() — Finds a user by email
// ------------------------------------------------------
export const findUserByEmail = async (email: string) => {
	return await UserModel.findOne({ email }).select("+password");
};

// ------------------------------------------------------
// deleteRefreshToken() — Deletes a refresh token from the database
// ------------------------------------------------------
export const deleteRefreshToken = async (token: string) => {
	return await TokenModel.deleteOne({ token });
};

// ------------------------------------------------------
// isTokenExist() — Checks if a token exists in the database
// ------------------------------------------------------
export const isTokenExist = async (token: string): Promise<boolean> => {
	// Check if token exists in DB
	const tokenExist = await TokenModel.exists({ token });
	// Return true if token exists, false otherwise
	return !!tokenExist;
};

// ------------------------------------------------------
// findUserByIdLean() — Finds a user by ID using lean()
// ------------------------------------------------------
export const findUserByIdLean = async (id: string) => {
	// Find and return the user document by ID
	return await UserModel.findById(id).lean().exec();
};

// ------------------------------------------------------
// findUserByIdLean() — Finds a user by ID
// ------------------------------------------------------
export const findUserById = async (id: string) => {
	// Find and return the user document by ID
	return await UserModel.findById(id);
};
