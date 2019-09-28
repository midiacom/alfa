docker stop $(docker ps | egrep alfa | awk '{print $1}'); docker container prune --force
