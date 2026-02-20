# Use Node 20 or 22 (LTS) for AWS stability, even though you have 25 locally
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# AWS will look for this port
EXPOSE 3000

# Start the server
CMD [ "npm", "start" ]