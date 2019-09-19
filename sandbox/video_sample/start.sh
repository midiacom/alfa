#!/bin/bash
# run the Makefile
make

# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = destination ip
# $2 = destination port
./video_sample $1 $2