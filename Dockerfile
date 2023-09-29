FROM node:18

RUN apt update && apt -y upgrade
RUN apt install -y vim iputils-ping iproute2

WORKDIR /opt/telegraf-plugins

ADD package.json /opt/telegraf-plugins
ADD src/ /opt/telegraf-plugins/sr

RUN npm install