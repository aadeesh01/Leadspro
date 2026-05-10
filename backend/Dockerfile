FROM ghcr.io/puppeteer/puppeteer:latest

# Switch to root to configure permissions if necessary, but puppeteer runs as 'pptruser'
# We install dependencies as pptruser which is the default in this image.
USER root

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (ignoring scripts to avoid puppeteer postinstall downloading chrome again)
RUN npm install --ignore-scripts

# Switch back to the unprivileged user
USER pptruser

# Copy application files (make sure to set correct ownership)
COPY --chown=pptruser:pptruser . .

# Expose the application port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]
