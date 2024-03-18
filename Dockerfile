FROM node:20.11-alpine
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package.json /home/node/app
COPY package-lock.json /home/node/app
RUN npm ci
COPY . /home/node/app
RUN npm run build
ENTRYPOINT ["npm", "start"]
