#! /bin/bash
clear

cecho(){
    RED="\033[0;31m"
    GREEN="\033[0;32m"
    YELLOW="\033[1;33m"
    # ... ADD MORE COLORS
    NC="\033[0m" # No Color
    printf "${!1}${2} ${NC}\n"
}

function all {
    installAudioSample
    installUsbCamera
    installRtsp
    installVideoSample
    installMicUsb
    installUdpToUdp
    installGrayscale 
    installVideoCrop 
    installNoiseDetector 
    installVideoMerge 
    installFaceCounter
}

function installAudioSample {
    # The Device Types
    cecho "GREEN" 
    cecho "GREEN" ----------------------
    cecho "GREEN" "Build Virtual Device Audio Sample"
    cecho "GREEN" ----------------------
    cecho "GREEN" 
    cd ./device/audio_sample/
    docker build . -t alfa/device/audio_sample    
}

function installUsbCamera {
    cecho "GREEN" 
    cecho "GREEN" ----------------------
    cecho "GREEN" "Build Virtual Device Câmera USB"
    cecho "GREEN" ----------------------
    cecho "GREEN" 
    cd ./device/camera_usb/
    docker build . -t alfa/device/camera_usb    
}

function installRtsp {
    cecho "GREEN" 
    cecho "GREEN" ----------------------
    cecho "GREEN" "Build Virtual Device RTSP to UDP"
    cecho "GREEN" ----------------------
    cecho "GREEN" 

    cd ./device/rtsp_to_udp/
    docker build . -t alfa/device/rtsp_to_udp
} 

function installVideoSample {
    cecho "GREEN" 
    cecho "GREEN" ----------------------
    cecho "GREEN" "Build Virtual Device Video Sample"
    cecho "GREEN" ----------------------
    cecho "GREEN" 
    cd ./device/video_sample/
    docker build . -t alfa/device/video_sample
}

function installMicUsb {
    cecho "GREEN" 
    cecho "GREEN" ----------------------
    cecho "GREEN" "Build Virtual Device USB MIC"
    cecho "GREEN" ----------------------
    cecho "GREEN" 
    cd ./device/mic_device/
    docker build . -t alfa/device/mic_device
}

function installUdpToUdp {
    cecho "GREEN" 
    cecho "GREEN" ----------------------
    cecho "GREEN" "Build Plugin UDP to UDP"
    cecho "GREEN" ----------------------
    cecho "GREEN" 
    cd ./vms/udp_to_udp/
    docker build . -t alfa/vms/udp_to_udp
}

function installGrayscale {
    cecho "GREEN" 
    cecho "GREEN" ----------------------
    cecho "GREEN" "Build VMS UDP Video to Grayscale UDP Video"
    cecho "GREEN" ----------------------
    cecho "GREEN" 
    cd ./vms/udp_video_black_white/
    docker build . -t alfa/vms/udp_video_black_white    
}

function installVideoCrop {
    cecho "GREEN" 
    cecho "GREEN" ----------------------
    cecho "GREEN" "Build VMS UDP Video to Crop Video And UDP Video"
    cecho "GREEN" ----------------------
    cecho "GREEN" 
    cd ./vms/udp_video_crop
    docker build . -t alfa/vms/udp_video_crop
}

function installNoiseDetector {
    cecho "GREEN" 
    cecho "GREEN" ----------------------
    cecho "GREEN" "Build VMS Noise Detector"
    cecho "GREEN" ----------------------
    cecho "GREEN" 
    cd ./vms/noise_detector
    docker build . -t alfa/vms/noise_detector    
}

function installVideoMerge {
    cecho "GREEN" 
    cecho "GREEN" ----------------------
    cecho "GREEN" "Build VMS Video Merge"
    cecho "GREEN" ----------------------
    cecho "GREEN" 
    cd ./vms/video_merge
    docker build . -t alfa/vms/video_merge    
}

function installFaceCounter {
    cecho "GREEN" 
    cecho "GREEN" ----------------------
    cecho "GREEN" "Build VMS Face Counter"
    cecho "GREEN" ----------------------
    cecho "GREEN" 
    cd ./vms/face_counter
    docker build . -t alfa/vms/face_counter    
}

function installUdpFlex {
    cecho "GREEN" 
    cecho "GREEN" ----------------------
    cecho "GREEN" "Build VMS UDP Flex"
    cecho "GREEN" ----------------------
    cecho "GREEN" 
    cd ./vms/udp_flex
    docker build . -t alfa/vms/udp_flex
}

while [ 1 ]
do
CHOICE=$(
whiptail --title "Install VMS and Virtual Devices" --menu "What do you whant to install?" 17 50 8 \
    "0)" "All Virtual Device  & VMS."   \
	"1)" "Audio Sample [Virtual Device]."   \
    "2)" "USB Camera [Virtual Device]."   \
	"3)" "RTSP to USP [Virtual Device]."   \
    "4)" "Video Sample [Virtual Device]."   \
    "5)" "USB Mic [Virtual Device]."   \
    "6)" "UDP to UDP  Mic [VMS]."   \
    "7)" "Grayscale Video [VMS]."   \
    "8)" "Video Crop [VMS]."   \
    "9)" "Noise Detector [VMS]."   \
    "10)" "Video Merge [VMS]."   \
    "11)" "Face Counter [VMS]."   \
    "12)" "UDP Flex [VMS]."   \
	"13)" "Exit"  3>&2 2>&1 1>&3	
)

result=$(whoami)
case $CHOICE in
	"0)")   
        all
        whiptail --title "Finish" --msgbox "All the virtual nodes was installed." 8 78
        exit
	;;
	"1)")   
        installAudioSample
        result="Audio Sample Installed"	
	;;
	"2)")   
        installUsbCamera
        result="USB Camera Installed"
	;;

	"3)")   
        installRtsp
        result="RTSP to UDP Installed"
        ;;

	"4)")   
        installVideoSample
        result="Video Sample Installed"
        ;;

	"5)")   
        installMicUsb
        result="USB MIC Installed"
        ;;
	"6)")   
        installUdpToUdp
        result="UDP to UDP Installed"
        ;;
	"7)")   
        installGrayscale
        result="Grayscale Video UDP Installed"
        ;;
	"8)") 
        installVideoCrop
        result="Video Crop Installed"
        ;;
	"9)") 
        installNoiseDetector
        result="Noise Detector Installed"
        ;;
	"10)") 
        installVideoMerge
        result="Video Merge Installed"
        ;;
	"11)") 
        installFaceCounter
        result="Face Recognition Installed"
        ;;
	"12)")
        installUdpFlex
        result="UDP Flex Installed"
        ;;
	*) exit
        ;;
esac
whiptail --msgbox "$result" 20 78
done
