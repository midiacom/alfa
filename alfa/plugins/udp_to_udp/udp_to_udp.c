/*
Plugin Name: UDP Video Crop

What it do: Gets an udp video and crop it TOP LEFT RIGHT BOTTOM

Parameters:
    - DEST_IP:
    - DEST_PORT: 

Lauch program
./udp_to_udp localhost 5000

Pipeline to send video (simulating Remote SRC)
gst-launch-1.0  rtspsrc location=rtsp://192.168.0.102:8080/h264_ulaw.sdp \
    ! tee name=t \
    ! queue \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5000

Pipeline to send video (simulating Remote SRC)
gst-launch-1.0  rtspsrc location=rtsp://192.168.0.102:8080/h264_ulaw.sdp \
    ! tee name=t \
    ! queue \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=172.17.0.2 port=5000

Pipeline to send video (simulating SRC)
gst-launch-1.0 autovideosrc \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=172.17.0.2 port=5000

Pipeline to crop a video and send data to UDP dest (simulating de VMS)
gst-launch-1.0 \
    udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! udpsink host=localhost port=5001
 
Pipeline to show video (simulating the application)
gst-launch-1.0 \
    udpsrc port=10001 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink

./udp_to_udp localhost 5001

To create de dockerfile
docker build . -t alfa/plugin/udp_to_udp

docker run alfa/plugin/udp_to_udp 172.17.0.1 5001

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

    GstElement *pipeline, *udpsrc, *queue, *udpsink;
    GError *err = NULL;
    GMainLoop *loop;

    gst_init(&argc, &argv);
    loop = g_main_loop_new(NULL, FALSE);

    pipeline = gst_pipeline_new(NULL);
    udpsrc = gst_element_factory_make("udpsrc", NULL);
    queue = gst_element_factory_make("queue2", NULL);
    udpsink = gst_element_factory_make("udpsink", NULL);

	g_object_set(udpsrc, "port", 5000, NULL);
	
    g_object_set(udpsink, "host", argv[1], NULL);
    g_object_set(udpsink, "port", atoi(argv[2]), NULL);

	if (!udpsrc || !queue || !udpsink)
	{
		g_printerr("Not all elements could be created.\n");
		return -1;
	}

	gst_bin_add_many(GST_BIN(pipeline), udpsrc, queue, udpsink, NULL);

	// link the tee -> queue -> decodebin
	if (!gst_element_link_many(udpsrc, queue, udpsink, NULL))
	{
		g_error("Failed to link elements");
		return -1;
	}


    gst_element_set_state(pipeline, GST_STATE_PLAYING);

	// this is to create the dot file
    // https://github.com/anselmobattisti/alfa/wiki/Debug-a-gst-pipeline
	// GST_DEBUG_BIN_TO_DOT_FILE(GST_BIN(pipeline), GST_DEBUG_GRAPH_SHOW_VERBOSE, "pipeline");

    g_main_loop_run(loop);

    return 0;
}

/*
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

    asprintf(&pipeline_string, "udpsrc port=5000 \
    ! udpsink host=%s port=%d", argv[1], atoi(argv[2]));

    pipeline = gst_parse_launch(pipeline_string, &err);

    gst_element_set_state(pipeline, GST_STATE_PLAYING);

    g_main_loop_run(loop);

    return 0;
}
*/