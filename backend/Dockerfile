# Use a lightweight Node.js 20 image based on Alpine Linux
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package management files first to capitalize on Docker's layer caching
COPY package*.json ./

# Install dependencies including production only (optional, can be modified)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the application port (defaults to 5000 in your server.js)
EXPOSE 5000

# Set environment to production (optional, can be overridden)
ENV NODE_ENV=production

# Start the application
CMD ["node", "src/server.js"]
