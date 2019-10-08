/*
Plugin Name: UDP Video Crop

What it do: Gets an udp video and crop it TOP LEFT RIGHT BOTTOM

Parameters:
    - TOP :
    - LEFT: 
    - RIGHT:
    - BOTTOM: 
    - DEST_IP:
    - DEST_PORT: 

Lauch program
./udp_video_crop 100 100 100 100 localhost 5000

Pipeline to send video (simulating SRC)
gst-launch-1.0 v4l2src device=/dev/video0 \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5000

// send video inside a container
gst-launch-1.0 v4l2src device=/dev/video0 \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=172.17.0.1 port=5000

Pipeline to crop a video and send data to UDP dest (simulating de VMS)
gst-launch-1.0 \
    udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videocrop top=200 left=100 right=4 bottom=0 \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5001
 
Pipeline to show video (simulating the application)
gst-launch-1.0 \
    udpsrc port=5002 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink


gst-launch-1.0 \
    udpsrc port=5001 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! queue2 \
    ! decodebin \
    ! glimagesink

To create de dockerfile
docker build . -t alfa/plugin/udp_video_crop

docker run alfa/plugin/udp_video_crop 100 100 100 100 172.17.0.1 5001

./udp_video_crop 100 100 100 100 172.17.0.1 10001

export GST_DEBUG="*:3"
*/

#include <stdio.h>
#include <stdlib.h>
#include <gst/gst.h>
#include <glib.h>

int main(int argc, char *argv[]){

    if (argc != 7) {
      g_printerr ("Usage:TOP LEFT RIGHT BOTTOM IP_DEST PORT \n");
      return -1;
    }

    GstElement *pipeline;
    GError *err = NULL;
    GMainLoop *loop;

    gst_init(&argc, &argv);
    loop = g_main_loop_new(NULL, FALSE);

    char* pipeline_string;

    asprintf(&pipeline_string, "udpsrc port=5000 caps = \"application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96\" \
    ! rtph264depay \
    ! decodebin \
    ! videocrop top=%d left=%d right=%d bottom=%d \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=%s port=%d",atoi(argv[1]), atoi(argv[2]), atoi(argv[3]), atoi(argv[4]), argv[5], atoi(argv[6]));

    pipeline = gst_parse_launch(pipeline_string, &err);

    gst_element_set_state(pipeline, GST_STATE_PLAYING);

    g_main_loop_run(loop);

    return 0;
}