#!/bin/bash
# run the Makefile
make

export GST_DEBUG="*:0"

# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = port 
# $2 = destination ip
# $3 = destination port
./udp_video_black_white $1 $2 $3