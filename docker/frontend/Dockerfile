# Use a specific version of Node.js
FROM node:24

# Set working directory
WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Expose port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev"]
