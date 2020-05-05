#!/bin/bash
# run the Makefile
make

export GST_DEBUG_DUMP_DOT_DIR=/tmp
export GST_DEBUG="*:0"

# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = device Id
# $2 = video pattern
./video_sample $1 $2