# Base image from docker
FROM alpine:3.10.0

# instalation of gstreamer and bash gcc (build-base)
RUN apk add --update --no-cache \
    bash \
    build-base \ 
    musl-dev

# copy my files to the container
COPY ./Makefile ./Makefile
COPY ./mqtt.c ./mqtt.c
COPY ./mqtt.h ./mqtt.h
COPY ./mqtt_pal.c ./mqtt_pal.c
COPY ./mqtt_pal.h ./mqtt_pal.h
COPY ./udpproxy.c ./udpproxy.c

# this script compile the source code and run the program
COPY ./start.sh ./start.sh

USER root

ENTRYPOINT ["/bin/bash", "./start.sh"]
# ENTRYPOINT ["./start.sh"]