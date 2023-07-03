# Use the base image with Node.js
FROM node:18.16.0

# Copy the current directory into the Docker image
COPY . /resources-api

# Set working directory for future use
WORKDIR /resources-api

# Install the dependencies from package.json
RUN npm install --legacy-peer-deps
RUN npm run lint
RUN npm run lint:fix
#RUN npm run build
#RUN npm run test

CMD npm start