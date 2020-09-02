#!/bin/bash
docker build . -t alfa/component/image_broker/vms_mlo

# docker run -p 5555:5555/tcp --name image_broker alfa/component/image_broker
docker run --name vms_mlo alfa/component/image_broker/vms_mlo "tcp://172.17.0.1:5555"