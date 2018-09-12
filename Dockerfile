FROM node:8
ENV NPM_CONFIG_LOGLEVEL warn
WORKDIR /src
COPY package.json ./
COPY package-lock.json ./
COPY truffle.js ./
COPY contracts ./contracts/
COPY migrations ./migrations/
COPY bin/docker-truffle.sh /bin/docker-truffle.sh
RUN npm install
RUN npm install -g truffle
RUN truffle compile
