FROM ubuntu:16.04
RUN apt-get update

# utilities
RUN apt-get install -y curl tcl git vim apt-utils build-essential net-tools wget && \
	apt-get install -y software-properties-common python-software-properties

# node.js - dependencies of ipfs get a compile error in 8.x and 10.x
WORKDIR /tmp
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
RUN apt-get install -y nodejs

# install node modules
WORKDIR /opt/js
RUN git clone https://github.com/OriginProtocol/origin-js.git source
WORKDIR /opt/js/source
RUN git checkout develop
ENV NODE_PATH=/opt/js/node_modules
RUN npm run install:dev

# run everything with pm2
WORKDIR /opt
RUN npm install -g pm2
COPY files/process.json /opt
RUN apt-get install -y sudo

# cleanup
RUN rm -rf /tmp/*

# TODO: pull these from configs
EXPOSE 5002 8080 8081 8545

CMD pm2-runtime /opt/process.json --web 4000
