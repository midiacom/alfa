#!/bin/bash
# run the Makefile
make

export GST_DEBUG="*:3"

# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = device path
# $2 = virtual device id
# ping g1.com.br
./mic_device $1 $2