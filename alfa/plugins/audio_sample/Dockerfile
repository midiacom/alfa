FROM alpine:3.10.0

RUN apk add --update --no-cache \
    bash \
    build-base \
    gstreamer gstreamer-dev  \
    gst-plugins-base \
    gst-plugins-good


COPY ./audio_sample.c ./audio_sample.c
COPY ./musica.ogg ./musica.ogg
COPY ./Makefile ./Makefile
COPY ./start.sh ./start.sh
ENTRYPOINT ["./start.sh"]

# CMD ["./audio_sample", "localhost", "5000"]
# COPY ./main.c ./main.c
# COPY ./start.sh ./start.sh
# ENTRYPOINT ["./start.sh"]
# ENTRYPOINT ["./start.sh"]


# CMD ["./start.sh"]
# CMD ["ping", "terra.com.br"]
# ENTRYPOINT ["./main"]
# ENTRYPOINT ["./usr/app/main"]


# CMD [%path/audio_sample]
# FROM docker/whalesay:latest
# LABEL Name=alfa Version=0.0.1
# RUN apt-get -y update && apt-get install -y fortunes
# CMD /usr/games/fortune -a | cowsay

# sudo docker build . -t alfa/plugin/audio_sample 
# sudo docker run alfa/plugin/audio_sample 