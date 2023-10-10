FROM node:18

# update system
RUN apt update && apt -y upgrade
RUN apt install -y git curl

# install telegraf
RUN curl -s https://repos.influxdata.com/influxdata-archive_compat.key > influxdata-archive_compat.key
RUN echo '393e8779c89ac8d958f81f942f9ad7fb82a25e133faddaf92e15b16e6ac9ce4c influxdata-archive_compat.key' | sha256sum -c && cat influxdata-archive_compat.key | gpg --dearmor | tee /etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg > /dev/null
RUN echo 'deb [signed-by=/etc/apt/trusted.gpg.d/influxdata-archive_compat.gpg] https://repos.influxdata.com/debian stable main' | tee /etc/apt/sources.list.d/influxdata.list
RUN apt update && apt install -y telegraf

# install telegraf-plugins
WORKDIR /opt/smarthome-telegraf

ADD src/ src/
ADD package.json .

RUN npm install

CMD ["telegraf", "--config", "/etc/telegraf.conf"]