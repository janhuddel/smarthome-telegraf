FROM node:18

# update system
RUN apt update && apt -y upgrade
RUN apt install -y git curl

# install telegraf
RUN curl -s https://repos.influxdata.com/influxdata-archive.key > influxdata-archive.key
RUN echo '40557e261cdbdccac91a2dde474cbf101ef672661e64b211b711cc0b904d5dac influxdata-archive.key' | sha256sum -c && cat influxdata-archive.key | gpg --dearmor | tee /etc/apt/trusted.gpg.d/influxdata-archive.gpg > /dev/null
RUN echo 'deb [signed-by=/etc/apt/trusted.gpg.d/influxdata-archive.gpg] https://repos.influxdata.com/debian stable main' | tee /etc/apt/sources.list.d/influxdata.list
RUN apt update && apt install -y telegraf

# install telegraf-plugins
WORKDIR /opt/smarthome-telegraf

ADD src/ src/
ADD package.json .

RUN npm install

CMD ["telegraf", "--config", "/etc/telegraf.conf"]