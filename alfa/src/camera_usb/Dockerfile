# Base image from docker
FROM alpine:3.10.0

RUN addgroup -g 1000 -S username && \
    adduser -u 1000 -S username -G username

# instalation of gstreamer and bash gcc (build-base)
RUN apk add --update --no-cache \
    bash \
    build-base \
    gstreamer gstreamer-dev  \
    gst-plugins-base \
    gst-plugins-good \
    gst-plugins-ugly \
    gst-plugins-bad \
    x264-dev \
    x264-libs \
    gst-libav \
    libressl \
    libc6-compat

# copy my files to the container
COPY ./paho.mqtt.c ./paho.mqtt.c
COPY ./Makefile ./Makefile
COPY ./camera_usb.c ./camera_usb.c
COPY ./camera_usb ./camera_usb

# this script compile the source code and run the program
COPY ./start.sh ./start.sh

USER root

ENTRYPOINT ["./start.sh"]