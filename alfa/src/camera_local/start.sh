#!/bin/bash
# run the Makefile
make

export GST_DEBUG="*:4"

# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = local where the device is mapped
# $2 = destination ip
# $3 = destination port
./camera_local $1 $2 $3