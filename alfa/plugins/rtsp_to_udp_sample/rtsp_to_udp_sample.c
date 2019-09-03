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

Sample pipeline to send video
gst-launch-1.0 rtspsrc location=rtsp://192.168.0.110:8080/h264_ulaw.sdp ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! autovideosink

gst-launch-1.0 -v autovideosrc ! x264enc ! rtph264pay ! udpsink host=localhost port=9000

To show video
gst-launch-1.0 -v udpsrc port=9000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" ! rtph264depay ! decodebin ! videoconvert ! autovideosink
gst-launch-1.0 -v udpsrc port=9001 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" ! rtph264depay ! decodebin ! videoconvert ! autovideosink

To create de dockerfile
sudo docker build . -t alfa/plugin/video_sample 

sudo docker run alfa/plugin/video_sample 
*/
#include <stdlib.h>
#include <gst/gst.h>
#include <glib.h>

int main (int argc, char *argv[]){
  GMainLoop *loop;
  GstElement *pipeline, *videosrc, *enc, *pay, *udp;

  gst_init (&argc, &argv);

  loop = g_main_loop_new (NULL, FALSE);

  if (argc != 3) {
    g_printerr ("Usage: IP PORT\n");
    return -1;
  }

  pipeline  = gst_pipeline_new ("video-player");
  videosrc  = gst_element_factory_make ("autovideosrc", "source");
  enc       = gst_element_factory_make ("x264enc",  "enc");
  pay       = gst_element_factory_make ("rtph264pay",  "rtph264pay");
  udp       = gst_element_factory_make("udpsink", "udp");

  g_object_set (G_OBJECT (udp), "host", argv[1], NULL);
  g_object_set (G_OBJECT (udp), "port", atoi(argv[2]), NULL);

  if (!pipeline) {
    g_printerr ("Pipeline.\n");
    return -1;
  }

  if (!videosrc) {
    g_printerr ("Souce.\n");
    return -1;
  }

  if (!enc) {
    g_printerr ("Enc.\n");
    return -1;
  }

  if (!pay) {
    g_printerr ("pay.\n");
    return -1;
  }

  if (!udp) {
    g_printerr ("udp.\n");
    return -1;
  }

  gst_bin_add_many (GST_BIN (pipeline), videosrc, enc, pay, udp, NULL);

  if (gst_element_link_many (videosrc, enc, pay, udp, NULL) != TRUE){
    return -1;
  }

  gst_element_set_state (pipeline, GST_STATE_PLAYING);

  g_main_loop_run (loop);

  gst_element_set_state (pipeline, GST_STATE_NULL);
  gst_object_unref (GST_OBJECT (pipeline));
  g_main_loop_unref (loop);

  return 0;
}