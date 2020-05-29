#!/bin/bash
# run the Makefile
make

# parse the space string in array
spo=$1
OIFS=$IFS
IFS=' '
spo_array=($spo)
IFS=$OIFS

# this ip is the docker machine ip docker0: see the value using
# $1 = destination ip
# $2 = destination port
# $3 = time do heart beat
# $4 = identificador do fluxo

# data collector
# example: ./udp_proxy -P 6001 -R 192.168.0.1:3000/vms/monitor
./udp_proxy -P 6001 -mq localhost -R http://rest-api:3000/vms/monitor &

# data forwarder
# ./udp_proxy -i A1 -ch 127.0.0.1 -cp 6001 192.168.0.1 5008
# example ./udp_proxy -i A1 -ch 127.0.0.1 192.168.0.1 5008
# echo "./udp_proxy -ch 127.0.0.1 -cp 6001 -i ${spo_array[2]} ${spo_array[0]} ${spo_array[1]}"
./udp_proxy -ch 127.0.0.1 -cp 6001 -mq localhost -hs ${spo_array[2]} -i ${spo_array[3]} ${spo_array[0]} ${spo_array[1]}