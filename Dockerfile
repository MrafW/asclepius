# Use the official Node.js image (Debian-based) as the base image
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if you have one)
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Install additional dependencies for TensorFlow
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    libc6-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy the rest of your application code
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# Define the command to start your app
CMD ["npm", "start"]