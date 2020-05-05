#!/bin/bash
# run the Makefile
make

export GST_DEBUG="*:0"

# this ip is the docker machine ip docker0: see the value using
# $1 = destination ip
# $2 = destination port
./video_merge $1 $2