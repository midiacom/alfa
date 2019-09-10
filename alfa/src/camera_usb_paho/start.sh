#!/bin/bash
# run the Makefile

apk --no-cache add ca-certificates wget
wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.30-r0/glibc-2.30-r0.apk
apk add glibc-2.30-r0.apk

make -C ./paho.mqtt.c 
make -C ./paho.mqtt.c install

make

export GST_DEBUG="*:6"

# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = device path
# $2 = virtual device id
# ping g1.com.br
./camera_usb $1 $2