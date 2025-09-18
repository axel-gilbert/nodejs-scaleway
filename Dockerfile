FROM node:20-alpine

WORKDIR /app

# Install app dependencies (none are required for this minimal app)
COPY package.json ./

# Copy application source
COPY server.js ./

# Allow overriding NODE_ENV at build time for dev/prod images
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
