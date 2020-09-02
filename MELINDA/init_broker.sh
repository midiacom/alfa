#!/bin/bash
docker build . -t alfa/component/image_broker

# docker run -p 5555:5555/tcp --name image_broker alfa/component/image_broker
docker run --network alfa_swarm_overlay3 --name image_broker -p 5555:5555/tcp alfa/component/image_broker "tcp://vms_flo:5565" "tcp://172.17.0.1:5575"