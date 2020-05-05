#!/bin/bash
export GST_DEBUG="*:0"
# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = Topic in MQTT Server
# $2 = IP in MQTT Server
# $3 = PORT in MQTT Server

# inside container
python /root/face_counter/face_counter.py $1 $2 $3

# local
# python3 face_counter.py $1 $2 $3