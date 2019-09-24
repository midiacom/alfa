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
    gst-plugins-bad
    
# copy my files to the container
COPY ./mqtt ./mqtt
COPY ./Makefile ./Makefile
COPY ./sample.mp3 ./sample.mp3
COPY ./audio_sample.c ./audio_sample.c

# this script compile the source code and run the program
COPY ./start.sh ./start.sh

USER root

ENTRYPOINT ["./start.sh"]