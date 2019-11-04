docker stop $(docker ps | egrep src | awk '{print $1}'); docker container prune --force
docker stop $(docker ps | egrep plugin | awk '{print $1}'); docker container prune --force
