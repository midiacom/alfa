/*
Plugin Name: Camera local

It takes the data from a local device /dev/video0 send to many VMS

Pipeline: 
Capture and send video 
gst-launch-1.0 v4l2src device=/dev/video0 \
    ! tee name=t \
    ! queue \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5000 \
    t. \
    ! queue \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5001 \


Show the video

gst-launch-1.0 \
    udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink

Parameters:
    - LOCAL OF DEVICE

Lauch program
./video /dev/video0
./video /dev/video0

To create de dockerfile

sudo docker build . -t alfa/src/camera_local 

sudo docker run alfa/src/camera_local /dev/video0 172.17.0.1 5000


To get the devices list
v4l2-ctl --list-devices

To get the specification of a specifica camera
v4l2-ctl --all -d /dev/video0
*/

#include <string.h>
#include <gst/gst.h>
#include <signal.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>

// v4l2src ! tee name=t t. ! x264enc ! mp4mux ! filesink location=/home/rish/Desktop/okay.264 t. ! videoconvert ! autovideosink

static GMainLoop *loop;
// static GstElement *pipeline, *src, *decodebin, *tee, *encoder, *muxer, *filesink, *videoconvert, *queue_record, *queue_display;
static GstBus *bus;

static GstElement *pipeline, *src, *tee;
//, *queue, *decodebin, *x264enc, *rtph264pay, *udpsink;

/*

gst-launch-1.0 v4l2src device=/dev/video0 \
    ! tee name=t \
    ! queue \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5000 \
*/
static gboolean
message_cb (GstBus * bus, GstMessage * message, gpointer user_data)
{
  if (user_data) {} 
  if (bus) {} 
  switch (GST_MESSAGE_TYPE (message)) {
    case GST_MESSAGE_ERROR:{
      GError *err = NULL;
      gchar *name, *debug = NULL;

      name = gst_object_get_path_string (message->src);
      gst_message_parse_error (message, &err, &debug);

      g_printerr ("ERROR: from element %s: %s\n", name, err->message);
      if (debug != NULL)
        g_printerr ("Additional debug info:\n%s\n", debug);

      g_error_free (err);
      g_free (debug);
      g_free (name);

      g_main_loop_quit (loop);
      break;
    }
    case GST_MESSAGE_WARNING:{
		GError *err = NULL;
		gchar *name, *debug = NULL;

		name = gst_object_get_path_string (message->src);
		gst_message_parse_warning (message, &err, &debug);

		g_printerr ("ERROR: from element %s: %s\n", name, err->message);
		if (debug != NULL)
		g_printerr ("Additional debug info:\n%s\n", debug);

		g_error_free (err);
		g_free (debug);
		g_free (name);
		break;
    }
    case GST_MESSAGE_EOS:{
		g_print ("Got EOS\n");
		g_main_loop_quit (loop);
		gst_element_set_state (pipeline, GST_STATE_NULL);
		g_main_loop_unref (loop);
		gst_object_unref (pipeline);
		exit(0);
		break;
	}
    default:
		break;
  }

  return TRUE;
}

int sigintHandler(int unused) {
	if (unused) {}
	g_print("You ctrl-c-ed!");
	gst_element_send_event(pipeline, gst_event_new_eos()); 
	return 0;
}

static void cb_new_pad (GstElement *element, GstPad *pad, gpointer data){
  gchar *name;
  GstElement *other = data;
  name = gst_pad_get_name (pad);
  g_print ("A new pad %s was created for %s\n", name, gst_element_get_name(element));
  g_free (name);
  g_print ("element %s will be linked to %s\n",
           gst_element_get_name(element),
           gst_element_get_name(other));
  gst_element_link(element, other);
}

int addQueue(GstElement *pipeline, GstElement *tee, int host) {
	// add a new queue to a tee :)
	GstElement *queue, *decodebin, *x264enc, *rtph264pay, *udpsink;
	queue = gst_element_factory_make("queue", NULL);
	decodebin = gst_element_factory_make("decodebin", NULL);
	x264enc = gst_element_factory_make("x264enc", NULL);
	rtph264pay = gst_element_factory_make("rtph264pay", NULL);
	udpsink = gst_element_factory_make("udpsink", NULL);

	g_object_set(udpsink, "host", "localhost", NULL);
	g_object_set(udpsink, "port", host, NULL);

	if (!queue || !decodebin || !x264enc || !rtph264pay || !udpsink) {
		g_printerr ("Not all elements could be created.\n");
		return -1;
	}

	gst_bin_add_many(GST_BIN(pipeline), queue, decodebin, x264enc, rtph264pay, udpsink, NULL);

	// link the tee -> queue -> decodebin
	if (!gst_element_link_many(tee, queue, decodebin, NULL)) {
		g_error("Failed to link elements A");
		return -1;
	}
	
	// link the x264 -> rtp -> udpsink
	if (!gst_element_link_many(x264enc, rtph264pay, udpsink, NULL)) {
		g_error("Failed to link elements B");
		return -1;
	}

	// quen de decodebin has something to play the pad will be linked betewen decodebin and x264
	g_signal_connect (decodebin, "pad-added", G_CALLBACK (cb_new_pad), x264enc);

	return 1;
}

int main(int argc, char *argv[])
{
	// signal(SIGINT, sigintHandler);
	gst_init (&argc, &argv);

	pipeline = gst_pipeline_new(NULL);
	src = gst_element_factory_make("v4l2src", NULL);
	tee = gst_element_factory_make("tee", "tee");

	g_object_set(src, "device", "/dev/video0", NULL);

	if (!pipeline || !src || !tee ){
		g_error("Failed to create elements");
		return -1;
	}

	loop = g_main_loop_new(NULL, FALSE);

	bus = gst_pipeline_get_bus(GST_PIPELINE (pipeline));
	gst_bus_add_signal_watch(bus);
	g_signal_connect(G_OBJECT(bus), "message", G_CALLBACK(message_cb), NULL);
	gst_object_unref(GST_OBJECT(bus));

	gst_bin_add_many(GST_BIN(pipeline), src, tee, NULL);
	if (!gst_element_link_many(src, tee, NULL)) { 
		g_error("Failed to link elements");
		return -2;
	}

	addQueue(pipeline, tee, 5000);
	addQueue(pipeline, tee, 5001);

	loop = g_main_loop_new(NULL, FALSE);

	bus = gst_pipeline_get_bus(GST_PIPELINE (pipeline));
	gst_bus_add_signal_watch(bus);
	g_signal_connect(G_OBJECT(bus), "message", G_CALLBACK(message_cb), NULL);
	gst_object_unref(GST_OBJECT(bus));

	gst_element_set_state(pipeline, GST_STATE_PLAYING);

	g_print("Starting loop");
	g_main_loop_run(loop);

	return 0;
}