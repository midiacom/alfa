#!/bin/bash
docker build . -t alfa/vms/melinda/dlo/pubtext

# docker run -p 5555:5555/tcp --name image_broker alfa/component/image_broker
docker run --network alfa_swarm_overlay3 -p 5575:5575/tcp --name vms_dlo alfa/vms/melinda/dlo/pubtext