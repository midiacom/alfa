#!/bin/bash
echo "Install PIP"
sudo apt install python3-pip

echo "Install OpenCV"
pip3 install opencv-python

echo "Install the bad plugin with h264 video codec"
sudo apt-get install gstreamer1.0-plugins-bad