# Base image from docker
FROM alpine:3.10.0

# instalation of gstreamer and bash gcc (build-base)
RUN apk add --update --no-cache \
    bash \
    gstreamer gstreamer-dev \
    gst-plugins-base \
    gst-plugins-good \
    gst-plugins-ugly \
    gst-plugins-bad \
    gst-libav \
    x264-dev \
    x264-libs \
    libressl \
    make

# copy my files to the container
COPY ./paho.mqtt.c ./paho.mqtt.c
COPY ./Makefile ./Makefile
COPY ./camera_usb.c ./camera_usb.c
COPY ./camera_usb ./camera_usb

# this script compile the source code and run the program
COPY ./start.sh ./start.sh

USER root

ENTRYPOINT ["./start.sh"]