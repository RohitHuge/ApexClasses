# Use a lightweight Node.js 20 image based on Alpine Linux
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package management files first to capitalize on Docker's layer caching
COPY package*.json ./

# Install dependencies (includes prisma CLI — needed for migrate deploy at startup)
RUN npm install

# Copy the rest of the application source code (prisma/, src/, prisma.config.ts, scripts/)
COPY . .

# Generate the Prisma client (no-op for runtime today, but keeps the image correct
# if any code starts importing src/db/prisma.js later)
RUN npx prisma generate

# Expose the application port (server.js uses process.env.PORT, defaults to 5000)
EXPOSE 5000

ENV NODE_ENV=production

# Apply any pending DB migrations, then start the server.
# prisma.config.ts uses DIRECT_URL, falling back to DATABASE_URL — so on the VPS
# (direct Postgres) only DATABASE_URL needs to be set. Migrate deploy is apply-only
# and a no-op when the DB is already up to date.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
