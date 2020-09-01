#!/bin/bash
echo "Stopping Broker"
docker container stop image_broker

echo "Removing Broker"
docker container rm image_broker