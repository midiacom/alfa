#!/bin/bash
# run the Makefile
make

# this ip is the docker machine ip docker0: see the value using
# ifconfig
./audio_sample 172.17.0.1 5000