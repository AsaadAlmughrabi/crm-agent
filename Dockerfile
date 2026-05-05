# Development Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the default Angular development port
EXPOSE 4200

# Run the application in development mode
# --host 0.0.0.0 is REQUIRED for Docker to expose the server
CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]
