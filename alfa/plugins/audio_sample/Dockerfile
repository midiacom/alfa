FROM alpine:3.10.0

ENV LANG=C.UTF-8

COPY ./audio_sample ./audio_sample
COPY ./musica.ogg ./musica.ogg

RUN chmod +x ./audio_sample

RUN apk add --update --no-cache \
    gstreamer gstreamer-dev \
    gst-plugins-base gst-plugins-base-dev 

CMD ["./audio_sample", "localhost", "5000"]

# FROM docker/whalesay:latest
# LABEL Name=alfa Version=0.0.1
# RUN apt-get -y update && apt-get install -y fortunes
# CMD /usr/games/fortune -a | cowsay

# sudo docker build . -t alfa/plugin/audio_sample 
# sudo docker run alfa/plugin/audio_sample 