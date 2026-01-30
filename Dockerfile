FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only package files first (better cache)
COPY package*.json ./

# Install dependencies
RUN npm install

# Explicitly ensure framer-motion is installed
RUN npm install framer-motion

# Copy rest of the app
COPY . .

# Expose Next.js dev port
EXPOSE 3000

# Start Next.js dev server
CMD ["npm", "run", "dev"]
