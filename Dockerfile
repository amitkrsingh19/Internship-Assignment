# Use Node 22 Alpine for a small footprint
FROM node:22-alpine

# Prisma needs openssl and libc6-compat to run on Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Generate the Prisma client during the build
RUN npx prisma generate

# We will use 8383 as your app's internal port
EXPOSE 8383

# Start command
# Using the array format ["npm", "run", "dev"] is better, 
# but since you need multiple commands, we'll use a shell script style:
CMD npx prisma db push && node ./src/server.js