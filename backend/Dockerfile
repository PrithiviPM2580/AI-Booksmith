# Use official lightweight Node.js image
FROM node:20-alpine3.20

# Set working directory inside container
WORKDIR /app


# 
ARG PNPM_VERSION
# Enable Corepack so pnpm/yarn become available
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Copy dependency files first for caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy all remaining project files
COPY . .

# Expose the app port (for documentation only)
EXPOSE 3000

# Start the application using pnpm
CMD ["pnpm", "dev"]