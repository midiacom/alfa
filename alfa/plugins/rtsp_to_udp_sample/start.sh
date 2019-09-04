#!/bin/bash
# run the Makefile
make

# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = rtsp source ip
# $2 = latency 
# $2 = destination ip
# $2 = destination port
./rtsp_to_udp_sample $1 $2 $3 $4