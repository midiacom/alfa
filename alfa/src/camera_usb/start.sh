#!/bin/bash
# run the Makefile

make -C ./paho.mqtt.c 
make -C ./paho.mqtt.c html 
make -C ./paho.mqtt.c install

make

export GST_DEBUG="*:0"

# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = device path
# $2 = virtual device id

echo $1

echo $2

ping g1.com.br
# ./camera_usb $1 $2