# Use the base image with Node.js
FROM node:14.21.3

# Copy the current directory into the Docker image
COPY . /resources-api

# Set working directory for future use
WORKDIR /resources-api

# Install the dependencies from package.json
RUN yarn install
RUN yarn lint
RUN yarn lint:fix

CMD node app.js
