#!/bin/bash

cecho(){
    RED="\033[0;31m"
    GREEN="\033[0;32m"
    YELLOW="\033[1;33m"
    # ... ADD MORE COLORS
    NC="\033[0m" # No Color

    printf "${!1}${2} ${NC}\n"
}

# The SRC Types
cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build SRC Audio Sample"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd src/audio_sample/
docker build . -t alfa/src/audio_sample

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build SRC Câmera USB"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../src/camera_usb/
docker build . -t alfa/src/camera_usb

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build SRC RTSP to UDP"
cecho "GREEN" ----------------------
cecho "GREEN" 

cd ../../src/rtsp_to_udp/
docker build . -t alfa/src/rtsp_to_udp

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build SRC Video Sample"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../src/video_sample/
docker build . -t alfa/src/video_sample

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build SRC Video Sample"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../src/mic_device/
docker build . -t alfa/src/mic_device

# The VMS Types
cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build Plugin UDP to UDP"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../plugins/udp_to_udp/
docker build . -t alfa/plugin/udp_to_udp

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build Plugin UDP Video to Black And White and UDP Video"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../plugins/udp_video_black_white/
docker build . -t alfa/plugin/udp_video_black_white

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build Plugin UDP Video to Crop Video And UDP Video"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../plugins/udp_video_crop
docker build . -t alfa/plugin/udp_video_crop

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build Plugin Noise Detector"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../plugins/noise_detector
docker build . -t alfa/plugin/noise_detector

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build Plugin Video Merge Plugin"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../plugins/video_merge
docker build . -t alfa/plugin/video_merge

cecho "GREEN" "-----------------------------"
cecho "GREEN" "The installation was completed"
cecho "GREEN" "-----------------------------"
