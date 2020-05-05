/*
Plugin Name: Video Merge

What it do: Gets two video and generate one video placing it side by side

Two important url for this VMS

* https://github.com/matthew1000/gstreamer-cheat-sheet/blob/master/mixing.md
* http://wiki.oz9aec.net/index.php/Gstreamer_cheat_sheet#Picture_in_Picture

Parameters:
    - DEST_IP:
    - DEST_PORT: 

Lauch program
./video_merge localhost 5000


// CAMERA
gst-launch-1.0 v4l2src device=/dev/video0 \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink port=5000

///////// THIS FORWARD A UDP VIDEO 
// get the video and sent via udp
gst-launch-1.0  videotestsrc pattern=ball \
    ! tee name=t \
    ! queue \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5001

// encaminha
gst-launch-1.0 \
    videomixer name=m sink_1::xpos=10 sink_1::ypos=10 sink_2::xpos=170 sink_2::ypos=10  \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5000 \
    videotestsrc pattern=white \
    ! video/x-raw, format=I420, framerate=5/1, width=330, height=170 \
    ! m. \
    udpsrc port=15000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! queue max-size-bytes=65536 max-size-buffers=65536 max-size-time=10 \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! videoscale \
    ! video/x-raw,width=150,height=150 \
    ! m. \
    udpsrc port=15001 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! queue max-size-bytes=65536 max-size-buffers=65536 max-size-time=10 \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! videoscale \
    ! video/x-raw,width=150,height=150 \
    ! m.

    videotestsrc pattern=green \
    ! videobox left=500 \
    ! video/x-raw, format=I420, framerate=5/1, width=300, height=200 \
    ! queue \
    ! m.

// show the video
gst-launch-1.0 \
    udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! queue2 max-size-bytes=65536 max-size-buffers=65536 max-size-time=10 \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink

///////// THIS SEND A UDP VIDEO 

To create de dockerfile
docker build . -t alfa/plugin/video_merge

docker run alfa/plugin/video_merge 172.17.0.1 5000

./video_merge localhost 5000

export GST_DEBUG="*:3"
*/

#include <stdio.h>
#include <stdlib.h>
#include <gst/gst.h>
#include <glib.h>

int main(int argc, char *argv[]){

    if (argc != 3) {
      g_printerr ("Usage:IP_DEST PORT \n");
      return -1;
    }

    GstElement *pipeline;
    GError *err = NULL;
    GMainLoop *loop;

    gst_init(&argc, &argv);
    loop = g_main_loop_new(NULL, FALSE);

    char* pipeline_string;

    asprintf(&pipeline_string, "videomixer name=m sink_1::xpos=10 sink_1::ypos=10 sink_2::xpos=320 sink_2::ypos=10  \
    ! x264enc \
    ! rtph264pay \
    ! queue2 \
    ! udpsink host=%s port=%d \
    videotestsrc pattern=white \
    ! video/x-raw, format=I420, framerate=5/1, width=630, height=320 \
    ! m. \
    udpsrc port=15000 caps = \"application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96\" \    
    ! queue2 \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! videoscale \
    ! video/x-raw,width=300,height=300 \
    ! queue2 \
    ! m. \
    udpsrc port=15001 caps = \"application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96\" \
    ! queue2 \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! videoscale \
    ! video/x-raw,width=300,height=300 \
    ! queue2 \
    ! m.",argv[1], atoi(argv[2]));

    pipeline = gst_parse_launch(pipeline_string, &err);

    gst_element_set_state(pipeline, GST_STATE_PLAYING);

    g_main_loop_run(loop);

    return 0;
}