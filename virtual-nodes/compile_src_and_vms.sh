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
cecho "GREEN" "Build Virtual Device Audio Sample"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd device/audio_sample/
docker build . -t alfa/device/audio_sample

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build Virtual Device Câmera USB"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../device/camera_usb/
docker build . -t alfa/device/camera_usb

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build Virtual Device RTSP to UDP"
cecho "GREEN" ----------------------
cecho "GREEN" 

cd ../../device/rtsp_to_udp/
docker build . -t alfa/device/rtsp_to_udp

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build Virtual Device Video Sample"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../src/video_sample/
docker build . -t alfa/src/video_sample

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build Virtual Device Video Sample"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../device/mic_device/
docker build . -t alfa/device/mic_device

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
cecho "GREEN" "Build VMS UDP Video to Black And White and UDP Video"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../vms/udp_video_black_white/
docker build . -t alfa/vms/udp_video_black_white

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build VMS UDP Video to Crop Video And UDP Video"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../vms/udp_video_crop
docker build . -t alfa/vms/udp_video_crop

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build VMS Noise Detector"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../vms/noise_detector
docker build . -t alfa/vms/noise_detector

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build VMS Video Merge"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../vms/video_merge
docker build . -t alfa/vms/video_merge

cecho "GREEN" 
cecho "GREEN" ----------------------
cecho "GREEN" "Build VMS Face Counter"
cecho "GREEN" ----------------------
cecho "GREEN" 
cd ../../vms/face_counter
docker build . -t alfa/vms/face_counter

cecho "GREEN" "-----------------------------"
cecho "GREEN" "The installation was completed"
cecho "GREEN" "-----------------------------"
