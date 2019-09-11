#!/bin/bash
# run the Makefile
make

export GST_DEBUG="*:0"

# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = top 
# $2 = left 
# $3 = right
# $4 = bottom
# $5 = destination ip
# $6 = destination port
./udp_video_crop $1 $2 $3 $4 $5 $6