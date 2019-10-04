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

Pipeline to send video (simulating SRC)
gst-launch-1.0  videotestsrc pattern=ball \
    ! tee name=t \
    ! queue \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5000

gst-launch-1.0  videotestsrc pattern=snow \
    ! tee name=t \
    ! queue \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5001


================
gst-launch-1.0  videomixer name=mixer ! videoconvert \
  videotestsrc ! video/x-raw, framerate=10/1 ! mixer. \
  udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
  ! rtph264depay \
  ! decodebin \
  ! videoconvert \
  ! mixer.
  

gst-launch-1.0 videomixer name=mixer sink_1::alpha=0.5 sink_1::xpos=50 sink_1::ypos=50 ! \
  videoconvert ! ximagesink \
  videotestsrc pattern=snow timestamp-offset=3000000000 ! \
  "video/x-raw,format=AYUV,width=640,height=480,framerate=(fraction)30/1" ! \
  queue2 ! mixer. \
  videotestsrc pattern=smpte ! \
  "video/x-raw,format=AYUV,width=800,height=600,framerate=(fraction)10/1" ! \
  queue2 ! mixer.
Acima funciona 

gst-launch-1.0   \
    udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    videoscale ! video/x-raw,width=640,height=360 ! \
    compositor name=mix sink_0::alpha=1 sink_1::alpha=1 sink_1::xpos=50 sink_1::ypos=50 !   \
    videoconvert ! autovideosink \
    videotestsrc pattern=ball ! \
    decodebin ! videoconvert ! \
    videoscale ! video/x-raw,width=320,height=180! \
    mix.

gst-launch-1.0 \
    compositor name=videomix sink_1::alpha=0.5 sink_1::xpos=50 sink_1::ypos=50 \
    ! autovideosink \
    videotestsrc pattern=pinwheel \
    ! videoscale \
    ! video/x-raw,width=800 \
    ! videomix.
    videotestsrc pattern=bar \
    ! videoscale \
    videotestsrc pattern=smpte ! \
    "video/x-raw,format=AYUV,width=800,height=600,framerate=(fraction)10/1" ! \    
    ! video/x-raw,width=100 \
    ! videomix.




gst-launch-1.0 compositor name=videomix sink_0::alpha=0.2 sink_0::xpos=50 sink_0::ypos=50 ! autovideosink \
    udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
        ! rtph264depay \
        ! decodebin \
        ! videoconvert \
        ! videomix.
    ! videotestsrc \
        ! videotestsrc \
        ! video/x-raw,width=1000 \
        ! videomix. \

gst-launch-1.0 -e videotestsrc pattern="snow" ! video/raw, framerate=10/1, width=200, height=150 ! videomixer name=mix ! \
    udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
        ! rtph264depay \
        ! decodebin \
        ! videoconvert \
        ! mix.

gst-launch-1.0 -v videomixer name=mix ! videoconvert ! autovideosink \
    udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! avdec_h264 \
    ! videobox left=-642 border-alpha=0.5 \
    ! mix. \
    udpsrc port=5001 \
    ! rtph264depay \
    ! avdec_h264 \
    ! videobox left=0 border-alpha=0.5 \
    ! mix.
================
// send video inside a container
gst-launch-1.0 v4l2src device=/dev/video0 \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5000
 
Pipeline to show video (simulating the application)
gst-launch-1.0 \
    udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink


gst-launch-1.0 \
    udpsrc port=5001 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink

To create de dockerfile
docker build . -t alfa/plugin/udp_video_crop

docker run alfa/plugin/udp_video_crop 100 100 100 100 172.17.0.1 5001

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