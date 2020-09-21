#!/bin/bash
echo "Stopping Orchestrator"
docker container stop melinda_orchestrator

docker container rm melinda_orchestrator

echo "Building Orchestrator"
docker build . -t alfa/vms/melinda/orchestrator

# echo "Running Orchestrator"
# docker run --network alfa_swarm_overlay3 --name melinda_orchestrator alfa/vms/melinda/orchestrator