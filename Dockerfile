# From the base image node
FROM node:20-alpine
WORKDIR /app

# Copy all the files from your file system to the container file system
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy other files as well
COPY ./ ./

COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

RUN apk update && apk add bash
# Expose the port
EXPOSE 3800

# Command to execute when the image is instantiated
CMD ["/wait-for-it.sh", "database:27017", "--", "npm", "run", "dev" ]