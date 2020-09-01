#!/bin/bash
docker build . -t alfa/component/image_broker

docker container stop image_broker

docker container rm image_broker

docker run -p 5555:5555/tcp --name image_broker alfa/component/image_broker