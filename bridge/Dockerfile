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
    psql --command 'CREATE DATABASE "bridge-server" OWNER docker;'
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
RUN git clone https://github.com/OriginProtocol/bridge-server.git
WORKDIR /opt/bridge-server/
RUN git branch --track origin remotes/origin/develop && \
	git checkout develop
RUN virtualenv bridge-server-venv && \
	. bridge-server-venv/bin/activate
# for compiling dependencies of bridge server... dependencies (on 16.04)
RUN apt-get install -y pkg-config libffi-dev autoconf libtool libssl-dev
# TODO: remove hacks
RUN sed -i '/pytest-*/d' requirements.txt
RUN bridge-server-venv/bin/pip3.6 install -r requirements.txt
COPY files/config/bridge_server_dev.env .env
# needed by flask
ENV LC_ALL=C.UTF-8 \
    LANG=C.UTF-8
RUN /etc/init.d/postgresql start && \
	. bridge-server-venv/bin/activate && \
	DATABASE_URL=postgresql://docker:docker@localhost:5432/bridge-server FLASK_APP=main.py flask db upgrade
# https://github.com/OriginProtocol/bridge-server/issues/71
RUN bridge-server-venv/bin/pip3.6 install kombu==4.1
# https://github.com/OriginProtocol/bridge-server/issues/74
RUN sed -i '24s/.*/    return True\n    """/' /opt/bridge-server/bridge-server-venv/lib/python3.6/site-packages/ipfsapi/client.py

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
COPY files/scripts/start-bridge-server.sh /opt/bridge-server
COPY files/scripts/start-celery.sh /opt/bridge-server
COPY files/scripts/start-pg.sh /opt/pg
COPY files/scripts/start-es.sh /opt/es
COPY files/process.json /opt
RUN apt-get install -y sudo

# cleanup
RUN rm -rf /tmp/*

# Expose ports for pm2 health check endpoint, bridge server, ipfs, postgres, redis, ganache, elasticsearch
# TODO: pull these from configs
EXPOSE 4000 5000 5002 8080 5432 6379 8545 9200

CMD pm2-runtime /opt/process.json --web 4000
