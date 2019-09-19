# Base image from docker
FROM alpine:3.10.0

# instalation of gstreamer and bash gcc (build-base)
RUN apk add --update --no-cache \
    bash \
    build-base \
    gstreamer gstreamer-dev  \
    gst-plugins-base \
    gst-plugins-good

# copy my files to the container
COPY ./audio_sample.c ./audio_sample.c
COPY ./musica.ogg ./musica.ogg
COPY ./Makefile ./Makefile

# this script compile the source code and run the program
COPY ./start.sh ./start.sh

ENTRYPOINT ["./start.sh"]