#!/bin/bash
# $1 = FPS
# $2 = MQTT Host
# $3 = MQTT Port
# $4 = The topic where the nodejs will post the nodes that must be processed
# $5 = The topic where the python will post the result of the process

# inside container
python /root/Orchestrator/Orchestrator.py --FPS=$1 --MQTT_HOST=$2 --MQTT_PORT=$3 --MQTT_TOPIC_NODES=$4 --MQTT_TOPIC_RESPONSE=$5