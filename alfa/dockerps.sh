#!/bin/bash

docker ps -a --format "table {{.Image}}\t{{.Names}}\t{{.Command}}" --no-trunc
