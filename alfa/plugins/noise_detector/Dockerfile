# Base image from docker
FROM alpine:3.10.0

# instalation of gstreamer and bash gcc (build-base)
RUN apk add --update --no-cache \
    bash \
    build-base \
    gstreamer gstreamer-dev  \
    gst-plugins-base \
    gst-plugins-good  \
    gst-plugins-ugly \
    gst-plugins-bad \
    gst-libav \
    pulseaudio \
    pulseaudio-alsa \
    tcpdump    

# copy my files to the container
COPY ./mqtt ./mqtt
COPY ./Makefile ./Makefile
COPY ./noise_detector.c ./noise_detector.c

# this script compile the source code and run the program
COPY ./start.sh ./start.sh

USER root

ENTRYPOINT ["./start.sh"]