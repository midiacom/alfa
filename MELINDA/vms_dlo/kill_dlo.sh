#!/bin/bash
echo "Stopping DLO"
docker container stop vms_dlo

echo "Removing DLO"
docker container rm vms_dlo