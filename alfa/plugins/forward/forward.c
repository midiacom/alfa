/*
Plugin Name: Foward

What it do: This is the simplest plugins that can be done. It's unique function is delivery a stream 
to an application via UDP. It's use gstreamer

Pipeline: SRC -> Forward -> Application

Parameters:
    - DEST: The IP and PORT that the stream must be delivered
    - APP_PARAMS: none
    - SRC: ?????????
    - DVMS_PARAMS: ??????????
*/

#include <gst/gst.h>

// gst-launch-1.0 videotestsrc ! videobalance saturation=0 ! x264enc ! video/x-h264, stream-format=byte-stream ! rtph264pay ! udpsink host=35.153.160.117 port=5000

int main (int argc, char *argv[]) {
    GstElement *pipeline, *src, *x264enc, *rtph264pay, *udpsink;
    GstBus *bus;
    GstMessage *msg;

    gst_init(&argc, &argv);

    pipeline = gst_element_factory_make("pipeline","pipeline");
    src = gst_element_factory_make("filesrc","src");
    x264enc = gst_element_factory_make ("x264enc", "x264enc");
    rtph264pay = gst_element_factory_make ("rtph264pay", "rtph264pay");
    udpsink = gst_element_factory_make ("udpsink", "udpsink");

    gst_bin_add_many (GST_BIN (pipeline), src, x264enc, rtph264pay, udpsink, NULL);
    gst_element_link_many (src, x264enc, rtph264pay, udpsink, NULL);
    g_object_set (G_OBJECT (src), "location", "../../../sample.mp4", NULL);

    gst_element_set_state (pipeline, GST_STATE_PLAYING);
// host=35.153.160.117 port=5000

    bus = gst_element_get_bus(pipeline);

    msg = gst_bus_timed_pop_filtered(bus,GST_CLOCK_TIME_NONE, GST_MESSAGE_ERROR | GST_MESSAGE_EOS);

    if (msg != NULL)
        gst_message_unref(msg);

    gst_object_unref(bus);
    gst_element_set_state (pipeline, GST_STATE_NULL);
    gst_object_unref (udpsink);
    gst_object_unref (rtph264pay);
    gst_object_unref (x264enc);
    gst_object_unref (pipeline);
    gst_object_unref (src);

    return 0;
}