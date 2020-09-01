#!/bin/bash
# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = Topic in MQTT Server
# $2 = IP in MQTT Server
# $3 = PORT in MQTT Server

# inside container
python /root/vms_mlo/mlo.py $1 $2 $3

# local
# python3 mlo.py -$1 $2 $3