# Base image from docker
FROM alpine:3.10.0

# instalation of gstreamer and bash gcc (build-base)
RUN apk add --update --no-cache \
    bash \
    build-base \ 
    musl-dev

# copy my files to the container
COPY ./Makefile ./Makefile
COPY ./udp_proxy.c ./udp_proxy.c

# this script compile the source code and run the program
COPY ./start.sh ./start.sh

USER root

ENTRYPOINT ["./start.sh"]