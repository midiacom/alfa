#!/bin/sh
# run the Makefile
make

echo "compilou"

# this ip is the docker machine ip docker0: see the value using
# $1 = destination ip
# $2 = destination port

VAR1=${1}
VAR2=":"
VAR3=${2}
VAR4="${VAR1}${VAR2}${VAR3}"

echo "${VAR4}"

# data collector
./udp_proxy -P 6001 -R http://rest-api:3000/vms/monitor &

#  ./udp_proxy -P 6001 -R http://172.17.0.1:3000/vms/monitor &

./udp_proxy -p 5000 -c 127.0.0.1:6001 "${VAR4}"


read 