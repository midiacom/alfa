#!/bin/bash
# run the Makefile
make

export GST_DEBUG="*:6"

# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = device Id
# $2 = rtsp source ip
./rtsp_to_udp $1 $2