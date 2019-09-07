/*
Plugin Name: Camera local

It takes the data from a local device /dev/video0 from example, and send it via
UDP to a IP HOST

Pipeline: 
Capture and send video 
gst-launch-1.0  v4l2src device=/dev/video0 \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=172.17.0.1 port=5000

Show the video
gst-launch-1.0 \
    udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink

Parameters:
    - LOCAL OF DEVICE
    - DEST_IP:
    - DEST_POST: 

Lauch program
./camera_local /dev/video0 172.17.0.1 5000
./camera_local /dev/video0 localhost 5000

To create de dockerfile
sudo docker build . -t alfa/src/camera_local 

sudo docker run alfa/src/camera_local /dev/video0 172.17.0.1 5000

It's needed to map de local decive inside de running container 

sudo docker run --privileged -v /dev/video0:/dev/video0 alfa/src/camera_local /dev/video0 172.17.0.1 5000

To get the devices list
v4l2-ctl --list-devices

To get the specification of a specifica camera
v4l2-ctl --all -d /dev/video0

To start a container with privileges
https://github.com/apocas/dockerode/issues/219
*/

#include <stdio.h>
#include <stdlib.h>
#include <gst/gst.h>
#include <glib.h>

int main(int argc, char *argv[]){

    if (argc != 4) {
      g_printerr ("Usage: LOCAL IP PORT\n");
      return -1;
    }

    GstElement *pipeline;
    GError *err = NULL;
    GMainLoop *loop;

    gst_init(&argc, &argv);
    loop = g_main_loop_new(NULL, FALSE);

    char* pipeline_string;

    asprintf(&pipeline_string, "v4l2src device=%s \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=%s port=%d",argv[1], argv[2], atoi(argv[3]));

    pipeline = gst_parse_launch(pipeline_string, &err);

    gst_element_set_state(pipeline, GST_STATE_PLAYING);
    g_main_loop_run(loop);
    return 0;
}