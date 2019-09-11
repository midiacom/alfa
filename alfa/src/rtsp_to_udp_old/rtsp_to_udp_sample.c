/*
Plugin Name: RTSP To UDP Sample

What it do: This is plugin connect to a RTSP source and transmit it using udp to a destintion 

Pipeline: 
TODO 

Parameters:
    - SOURCE_IP : 
    - SOURCE_PORT : 
    - DEST_IP:
    - DEST_POST: 

Lauch program
./rtsp_to_udp_sample rtsp://192.168.0.100:8080/h264_ulaw.sdp 3000 35.153.160.117 5000

Pipeline to send video
gst-launch-1.0  rtspsrc location=rtsp://192.168.0.100:8080/h264_ulaw.sdp latency=300 \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink port=5000

Sent to AMAZON
gst-launch-1.0  rtspsrc location=rtsp://192.168.0.100:8080/h264_ulaw.sdp latency=300 \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=35.153.160.117 port=5000

Pipeline to show video
gst-launch-1.0 \
    udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink

To create de dockerfile
sudo docker build . -t alfa/plugin/rtsp_to_udp_sample 

sudo docker run alfa/plugin/rtsp_to_udp_sample rtsp://192.168.0.100:8080/h264_ulaw.sdp 3000 35.153.160.117 5000
*/

#include <stdio.h>
#include <stdlib.h>
#include <gst/gst.h>
#include <glib.h>

int main(int argc, char *argv[]){

    if (argc != 5) {
      g_printerr ("Usage: RTSP LATENCY IP PORT\n");
      return -1;
    }

    GstElement *pipeline;
    GError *err = NULL;
    //GstBus *bus;
    GMainLoop *loop;

    gst_init(&argc, &argv);
    loop = g_main_loop_new(NULL, FALSE);

    char* pipeline_string;

    asprintf(&pipeline_string, "rtspsrc location=%s latency=%d \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=%s port=%d",argv[1],atoi(argv[2]), argv[3], atoi(argv[4]));

    pipeline = gst_parse_launch(pipeline_string, &err);

    gst_element_set_state(pipeline, GST_STATE_PLAYING);
    // bus = gst_element_get_bus(pipeline);
    // gst_bus_add_watch (bus, bus_call, loop);
    g_main_loop_run(loop);
    // free(pipeline_string);
    return 0;
}