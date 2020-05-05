docker stop $(docker ps | egrep device | awk '{print $1}'); docker container prune --force
docker stop $(docker ps | egrep vms | awk '{print $1}'); docker container prune --force
