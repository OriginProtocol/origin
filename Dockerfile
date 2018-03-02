FROM node:8
ENV NPM_CONFIG_LOGLEVEL warn
WORKDIR /src
COPY package.json /src/
COPY package-lock.json /src/
COPY truffle.js /src/
COPY contracts /src/contracts/
COPY migrations /src/migrations/
COPY bin/docker-truffle.sh /bin/docker-truffle.sh
RUN npm install
RUN npm install -g truffle
RUN truffle compile
