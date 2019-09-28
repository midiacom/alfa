#!/bin/bash
# run the Makefile
make

export GST_DEBUG="*:0"

# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = URL that will handle the message 
# $2 = Noise Sensitiveness
# $3 = Topic in MQTT Server
# $4 = IP in MQTT Server
# $5 = PORT in MQTT Server
./noise_detector $1 $2 $3 $4 $5
