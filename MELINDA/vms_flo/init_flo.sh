#!/bin/bash
docker build . -t alfa/component/image_broker/vms_flo

# docker run -p 5555:5555/tcp --name image_broker alfa/component/image_broker
docker run --network alfa_swarm_overlay3 -p 5565:5565/tcp --name vms_flo alfa/component/image_broker/vms_flo