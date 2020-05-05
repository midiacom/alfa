#!/bin/bash
clear
docker ps -a --format "table {{.Image}}\t{{.Names}}\t{{.Command}}" --no-trunc
