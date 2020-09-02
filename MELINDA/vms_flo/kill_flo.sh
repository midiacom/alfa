#!/bin/bash
echo "Stopping FLO"
docker container stop vms_flo

echo "Removing FLO"
docker container rm vms_flo