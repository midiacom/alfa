/*
Plugin Name: UDP Video to Black and White

What it do: Gets an udp video and send via udp to a client tranforming it in a black 
and white video 

Pipeline: 
TODO 

Parameters:
    - LISTEN_PORT : 
    - DEST_IP:
    - DEST_POST: 

Lauch program
./udp_video_black_white 5000 35.153.160.117 5000

Pipeline to send video (simulating SRC)
gst-launch-1.0 v4l2src device=/dev/video0 \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5000

gst-launch-1.0 v4l2src device=/dev/video0 \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=172.17.0.1 port=5000

Pipeline to covnert video in GREYSCALE and send data to UDP dest (simulating de VMS)
gst-launch-1.0 \
    udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videobalance saturation=0 \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5001
 
Pipeline to show video (simulating the application)
gst-launch-1.0 \
    udpsrc port=5001 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink

sudo -E gst-launch-1.0 videotestsrc ! videobalance saturation=0 ! x264enc ! video/x-h264, stream-format=byte-stream ! rtph264pay ! udpsink port=80

To create de dockerfile
docker build . -t alfa/plugin/udp_video_black_white

docker run alfa/plugin/udp_video_black_white 172.17.0.1 5001

export GST_DEBUG="*:3"
*/

#include <stdio.h>
#include <stdlib.h>
#include <gst/gst.h>
#include <glib.h>

int main(int argc, char *argv[]){

    if (argc != 3) {
      g_printerr ("Usage:IP PORT\n");
      return -1;
    }

    GstElement *pipeline;
    GError *err = NULL;
    //GstBus *bus;
    GMainLoop *loop;

    gst_init(&argc, &argv);
    loop = g_main_loop_new(NULL, FALSE);

    char* pipeline_string;

    asprintf(&pipeline_string, "udpsrc port=5000 caps = \"application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96\" \
    ! rtph264depay \
    ! decodebin \
    ! videobalance saturation=0 \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=%s port=%d",argv[1],atoi(argv[2]));

    pipeline = gst_parse_launch(pipeline_string, &err);

    gst_element_set_state(pipeline, GST_STATE_PLAYING);
    // bus = gst_element_get_bus(pipeline);
    // gst_bus_add_watch (bus, bus_call, loop);
    g_main_loop_run(loop);
    // free(pipeline_string);
    return 0;
}