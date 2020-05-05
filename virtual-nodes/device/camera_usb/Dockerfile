# Base image from docker
FROM alpine:3.10.0

# instalation of gstreamer and bash gcc (build-base)
RUN apk add --update --no-cache \
    bash \
    build-base \
    gstreamer gstreamer-dev \
    gst-plugins-base \
    gst-plugins-good \
    gst-plugins-ugly \
    gst-plugins-bad \
    gst-libav \
    x264-dev \
    x264-libs \
    libressl
    
# copy my files to the container
COPY ./mqtt ./mqtt
COPY ./Makefile ./Makefile
COPY ./camera_usb.c ./camera_usb.c

# this script compile the source code and run the program
COPY ./start.sh ./start.sh

USER root

ENTRYPOINT ["./start.sh"]