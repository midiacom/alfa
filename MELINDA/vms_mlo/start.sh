#!/bin/bash
# $1 = Image Broker tcp://localhost:5555

# inside container
python /root/vms_mlo/mlo.py --IP $1