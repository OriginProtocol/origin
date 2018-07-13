FROM ubuntu:16.04
RUN apt-get update

# utilities
RUN apt-get install -y curl tcl git vim apt-utils build-essential net-tools wget && \
	apt-get install -y software-properties-common python-software-properties

RUN add-apt-repository ppa:jonathonf/python-3.6 && \
	add-apt-repository ppa:ethereum/ethereum && \
	apt-get update

# node.js - dependencies of ipfs get a compile error in 8.x and 10.x
WORKDIR /tmp
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
RUN apt-get install -y nodejs

# Postgresql 9.3
# https://docs.docker.com/engine/examples/postgresql_service/#connecting-from-your-host-system
WORKDIR /opt/pg
RUN sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN apt-get update
RUN apt-get install -y postgresql-9.3
USER postgres
COPY files/config/pg_hba.conf /etc/postgresql/9.3/main/
COPY files/config/postgresql.conf /etc/postgresql/9.3/main/
RUN    /etc/init.d/postgresql start &&\
    psql --command "CREATE USER docker WITH SUPERUSER PASSWORD 'docker';" &&\
    psql --command 'CREATE DATABASE "origin-bridge" OWNER docker;'
USER root

# Redis 4.0+
WORKDIR /tmp
RUN curl -O http://download.redis.io/redis-stable.tar.gz && \
	tar xzvf redis-stable.tar.gz && \
	cd redis-stable &&  make install
RUN mkdir /etc/redis
COPY files/config/redis.conf /etc/redis
RUN adduser --system --group --no-create-home redis && \
	mkdir /var/lib/redis && \
	chown redis:redis /var/lib/redis && \
	chmod 770 /var/lib/redis

# Python 3.6
RUN apt-get install -y python3.6 python3.6-dev python3-pip
RUN ln -nvfs /usr/bin/python3.6 /usr/bin/python3 && \
	ln -nvfs /usr/bin/pip3
RUN pip3 install pip --upgrade

# Bridge server (develop branch)
# TODO: integrate envkey
WORKDIR /opt
RUN pip3 install virtualenv
WORKDIR /opt/origin-bridge
RUN git clone https://github.com/OriginProtocol/origin-bridge.git source
WORKDIR /opt/origin-bridge/source
RUN git checkout develop
WORKDIR /opt/origin-bridge
RUN virtualenv origin-bridge-venv && \
	. origin-bridge-venv/bin/activate
# for compiling dependencies of bridge server... dependencies (on 16.04)
RUN apt-get install -y pkg-config libffi-dev autoconf libtool libssl-dev
# TODO: remove hacks
WORKDIR /opt/origin-bridge/source
RUN sed -i '/pytest-*/d' requirements.txt
RUN ../origin-bridge-venv/bin/pip3.6 install -r requirements.txt
# needed by flask
ENV LC_ALL=C.UTF-8 \
    LANG=C.UTF-8
RUN /etc/init.d/postgresql start && \
	. ../origin-bridge-venv/bin/activate && \
	DATABASE_URL=postgresql://docker:docker@localhost:5432/origin-bridge FLASK_APP=main.py flask db upgrade
# https://github.com/OriginProtocol/origin-bridge/issues/71
RUN ../origin-bridge-venv/bin/pip3.6 install kombu==4.1
# https://github.com/OriginProtocol/origin-bridge/issues/74
RUN sed -i '24s/.*/    return True\n    """/' /opt/origin-bridge/origin-bridge-venv/lib/python3.6/site-packages/ipfsapi/client.py

# Copy wait for script for startup dependencies
COPY files/scripts/wait-for.sh /usr/local/bin
RUN chmod +x /usr/local/bin/wait-for.sh

# Copy start scripts for js and dapp
COPY files/scripts/start-js.sh /opt/origin-js/scripts/start-js.sh
COPY files/scripts/start-dapp.sh /opt/origin-dapp/scripts/start-dapp.sh

# Elasticsearch 5.4.3 (minimum across regions, of the highest version in a region)
WORKDIR /tmp
RUN apt-get install -y openjdk-8-jre
RUN curl -O https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.4.3.deb
RUN dpkg -i elasticsearch-5.4.3.deb
COPY files/config/elasticsearch.yml /etc/elasticsearch
# memory tuning
COPY files/config/etc_security_limits.conf /etc/security/limits.conf
RUN sed -i 's/-Xms2g/-Xms128m/' /etc/elasticsearch/jvm.options
RUN sed -i 's/-Xmx2g/-Xmx128m/' /etc/elasticsearch/jvm.options
RUN ln -s /etc/elasticsearch /usr/share/elasticsearch/config && \
	mkdir /usr/share/elasticsearch/logs && \
	chown elasticsearch:elasticsearch /usr/share/elasticsearch/logs -R && \
	mkdir /usr/share/elasticsearch/data && \
	chown elasticsearch:elasticsearch /usr/share/elasticsearch/data -R
WORKDIR /opt/es

# run everything with pm2 (thanks Gabo!)
WORKDIR /opt
RUN npm install -g pm2
RUN mkdir /opt/origin-bridge/scripts
COPY files/scripts/start-bridge.sh /opt/origin-bridge/scripts
COPY files/scripts/start-celery.sh /opt/origin-bridge/scripts
COPY files/scripts/run-tests.sh /opt/origin-bridge/scripts
RUN chmod +x /opt/origin-bridge/scripts/run-tests.sh
COPY files/scripts/start-pg.sh /opt/pg
COPY files/scripts/start-es.sh /opt/es
COPY files/process.json /opt
RUN apt-get install -y sudo

# cleanup
RUN rm -rf /tmp/*

CMD pm2-runtime /opt/process.json --web 4000
