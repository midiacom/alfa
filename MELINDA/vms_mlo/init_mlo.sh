#!/bin/bash
docker build . -t alfa/vms/melinda/mlo/qrcodedetect

# docker run -p 5555:5555/tcp --name image_broker alfa/component/image_broker
docker run --network alfa_swarm_overlay3 -p 5000:5000/udp --name vms_mlo alfa/vms/melinda/mlo/qrcodedetect "tcp://image_broker:5555"