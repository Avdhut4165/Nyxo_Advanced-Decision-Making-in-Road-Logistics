# Node.js Dockerfile for this Node/Express app
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies (using package-lock / npm ci for reproducible builds)
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Set environment
ENV NODE_ENV=production

# Expose port the app listens on
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
