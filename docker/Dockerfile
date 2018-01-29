# Run 
#   docker build -t origin:demo .
# to build the docker image.  This takes a while.
# Then run
#   docker run --rm --name origin -i --network=host origin:demo truffle develop
# Run `migrate` in the truffle cli
# In a separate terminal run
#   docker exec origin npm start
# You should be able to connect metamask to localhost:9545
FROM ubuntu:xenial
RUN apt-get update
RUN apt-get install -y curl build-essential
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs git
RUN npm install -g truffle
RUN git clone https://github.com/OriginProtocol/demo-dapp origin-demo-dapp
WORKDIR "origin-demo-dapp"
RUN npm install
