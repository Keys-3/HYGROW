FROM node:20

WORKDIR /app

# Install system dependencies for React Native DevTools / Expo
RUN apt-get update && apt-get install -y \
    libnspr4 \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libgtk-3-0 \
    libx11-xcb1 \
    && rm -rf /var/lib/apt/lists/*



# Install expo-cli globally
RUN npm install -g expo-cli concurrently @expo/ngrok

# Copy package files first to optimize caching
COPY package*.json ./
COPY FrontEnd/package*.json ./FrontEnd/
COPY BackEnd/package*.json ./BackEnd/

# Install all dependencies (root, frontend, backend)
RUN npm run install-all

# Copy the rest of the application code
COPY . .

# Change ownership to the node user and switch to it
RUN chown -R node:node /app
USER node

# Expose backend port
EXPOSE 3000

# Expose Expo ports
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Disable telemetry and Watchman (often causes issues in Docker)
ENV EXPO_NO_TELEMETRY=1
ENV WATCHMAN_DISABLE=1
ENV ELECTRON_NO_SANDBOX=1

# We will start both backend and frontend concurrently
CMD ["npm", "start"]
