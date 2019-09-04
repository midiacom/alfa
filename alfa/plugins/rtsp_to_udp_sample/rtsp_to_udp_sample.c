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
./rtsp_to_udp_sample rtsp://192.168.0.100:8080/h264_ulaw.sdp 3000 localhost 7001

Sample pipeline to send video
gst-launch-1.0  rtspsrc location=rtsp://192.168.0.100:8080/h264_ulaw.sdp latency=300 \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink port=7001

To show video
gst-launch-1.0 \
    udpsrc port=7001 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink

To create de dockerfile
sudo docker build . -t alfa/plugin/rtsp_to_udp_sample 

sudo docker run alfa/plugin/rtsp_to_udp_sample
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

    char* pipeline_string;
    asprintf(&pipeline_string, "rtspsrc location=%s latency=%d \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=%s port=%d",argv[1],atoi(argv[2]), argv[3], atoi(argv[4]));

    loop = g_main_loop_new(NULL, FALSE);
    pipeline = gst_parse_launch(pipeline_string, &err);
    gst_element_set_state(pipeline, GST_STATE_PLAYING);
    // bus = gst_element_get_bus(pipeline);
    // gst_bus_add_watch (bus, bus_call, loop);
    g_main_loop_run(loop);
    free(pipeline_string);
    return 0;
}

/*
#include <stdlib.h>
#include <gst/gst.h>
#include <glib.h>

int main (int argc, char *argv[]){
  GMainLoop *loop;
  GstElement *pipeline, *rtspsrc, *decodebin, *enc, *pay, *udp;

  gst_init (&argc, &argv);

  loop = g_main_loop_new (NULL, FALSE);

  if (argc != 5) {
    g_printerr ("Usage: RTSP LATENCY IP PORT\n");
    return -1;
  }

  pipeline  = gst_pipeline_new ("video-player");
  rtspsrc  = gst_element_factory_make ("rtspsrc", "source");
  g_object_set (G_OBJECT (rtspsrc), "location", argv[1], NULL);
  g_object_set (G_OBJECT (rtspsrc), "latency", atoi(argv[2]), NULL);
  decodebin       = gst_element_factory_make ("decodebin",  "decodebin");
  enc       = gst_element_factory_make ("x264enc",  "enc");
  pay       = gst_element_factory_make ("rtph264pay",  "rtph264pay");
  udp       = gst_element_factory_make("udpsink", "udp");
  g_object_set (G_OBJECT (udp), "host", argv[3], NULL);
  g_object_set (G_OBJECT (udp), "port", atoi(argv[4]), NULL);

  if (!pipeline) {
    g_printerr ("Pipeline.\n");
    return -1;
  }

  if (!rtspsrc) {
    g_printerr ("RTSP Souce.\n");
    return -1;
  }

  if (!decodebin) {
    g_printerr ("Decode bin.\n");
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

  gst_bin_add_many (GST_BIN (pipeline), rtspsrc, decodebin, enc, pay, udp, NULL);

  if (gst_element_link_many (rtspsrc, decodebin, enc, pay, udp, NULL) != TRUE){
    g_printerr ("Erro when link.\n");
    return -1;
  }

  gst_element_set_state (pipeline, GST_STATE_PLAYING);

  g_main_loop_run (loop);

  gst_element_set_state (pipeline, GST_STATE_NULL);
  gst_object_unref (GST_OBJECT (pipeline));
  g_main_loop_unref (loop);

  return 0;
}
*/