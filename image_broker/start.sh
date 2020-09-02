#!/bin/bash

# this ip is the docker machine ip docker0: see the value using
# ifconfig
# $1 = Topic in MQTT Server
# $2 = IP in MQTT Server
# $3 = PORT in MQTT Server

# inside container
# python /Broker.py $1 $2 $3
# python3 ./Broker.py --flo="tcp://172.17.0.1:5565" --dlo="tcp://172.17.0.1:5575"

# echo "teste"
# echo $1
# echo $2

python3 Broker.py --flo=$1 --dlo=$2