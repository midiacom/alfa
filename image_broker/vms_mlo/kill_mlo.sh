#!/bin/bash
echo "Stopping MLO"
docker container stop vms_mlo

echo "Removing MLO"
docker container rm vms_mlo