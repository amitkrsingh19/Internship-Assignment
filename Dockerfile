# Use an official node js version
FROM node:22-alpine

RUN apk add --no-cache openssl
# Set working directory in docker
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json .

# Install the dependencies
RUN npm install

# Copy the rest of the codebase (including the rest of source code)
COPY . .

# Generate prisma client
RUN npx prisma generate
# Expose PORT
EXPOSE 8383

# Define the command to run your application
# Use a shell string to run multiple commands
CMD npx prisma db push && npx prisma db push --accept-data-loss && node ./src/server.js