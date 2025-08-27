# Use Node.js 18 as the base image (matches React 18 requirements)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the Vite dev server port
EXPOSE 3000

# Run the dev server
CMD ["npm", "run", "dev"]