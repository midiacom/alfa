#!/bin/bash
# $1 = Image Broker tcp://localhost:5555
# python3 ./mlo.py --IP tcp://image_broker:555

# inside container
python /root/vms_mlo/mlo.py --IP $1