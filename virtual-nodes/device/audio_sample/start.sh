#!/bin/bash
# run the Makefile
make

export GST_DEBUG="*:0"

# parse the space string in array
spo=$1
OIFS=$IFS
IFS=' '
spo_array=($spo)
IFS=$OIFS

# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = device Id
# $2 = file path

./audio_sample ${spo_array[0]} ${spo_array[1]}