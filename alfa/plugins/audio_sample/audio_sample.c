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

Sample pipeline
gst-launch-1.0 -v filesrc location=../../../samples/musica.ogg ! oggdemux ! vorbisdec ! audioconvert ! rtpL24pay ! udpsink host=localhost auto-multicast=true port=5000    

To listen the audio
gst-launch-1.0 -v udpsrc uri=udp://localhost:5000 caps="application/x-rtp,channels=(int)2,format=(string)S16LE,media=(string)audio,payload=(int)96,clock-rate=(int)44100,encoding-name=(string)L24" ! rtpL24depay ! audioconvert ! autoaudiosink sync=false

Open Docker
sudo docker exec -it 869d0e923352 sh

Restart Docker
sudo systemctl restart docker

*/

#include <stdlib.h>
#include <gst/gst.h>
#include <glib.h>

static gboolean bus_call (GstBus *bus, GstMessage *msg, gpointer data){
  if (bus) {}
  GMainLoop *loop = (GMainLoop *) data;
  switch (GST_MESSAGE_TYPE (msg)) {
    case GST_MESSAGE_EOS:
      g_print ("End of stream\n");
      g_main_loop_quit (loop);
      break;
    case GST_MESSAGE_ERROR: {
      gchar  *debug;
      GError *error;
      gst_message_parse_error (msg, &error, &debug);
      g_free (debug);
      g_printerr ("Error: %s\n", error->message);
      g_error_free (error);
      g_main_loop_quit (loop);
      break;
    }
    default:
      break;
  }
  return TRUE;
}

static void on_pad_added (GstElement *element, GstPad *pad, gpointer data) {
  if (element) {}
  GstPad *sinkpad;
  GstElement *decoder = (GstElement *) data;
  /* We can now link this pad with the vorbis-decoder sink pad */
  g_print ("Dynamic pad created, linking demuxer/decoder\n");
  sinkpad = gst_element_get_static_pad (decoder, "sink");
  gst_pad_link (pad, sinkpad);
  gst_object_unref (sinkpad);
}

int main (int argc, char *argv[]){
  GMainLoop *loop;
  GstElement *pipeline, *source, *demuxer, *decoder, *conv, *sink;
  GstElement *rtpL24pay;
  GstBus *bus;
  guint bus_watch_id;

  /* Initialisation */
  gst_init (&argc, &argv);

  loop = g_main_loop_new (NULL, FALSE);

  /* Check input arguments */
  if (argc != 3) {
    g_printerr ("Usage: IP PORT\n");
    return -1;
  }

  /* Create gstreamer elements */
  pipeline  = gst_pipeline_new ("audio-player");
  source    = gst_element_factory_make ("filesrc",       "file-source");
  demuxer   = gst_element_factory_make ("oggdemux",      "ogg-demuxer");
  decoder   = gst_element_factory_make ("vorbisdec",     "vorbis-decoder");
  conv      = gst_element_factory_make ("audioconvert",  "converter");
  rtpL24pay = gst_element_factory_make ("rtpL24pay",  "rtpL24pay");
  sink      = gst_element_factory_make ("udpsink", "udpsink");
  g_object_set (G_OBJECT (sink), "host", argv[1], NULL);
  g_object_set (G_OBJECT (sink), "port", atoi(argv[2]), NULL);
  g_object_set (G_OBJECT (sink), "auto-multicast", 1, NULL);

  if (!pipeline) {
    g_printerr ("Pipeline.\n");
    return -1;
  }

  if (!source) {
    g_printerr ("Souce.\n");
    return -1;
  }

  if (!demuxer) {
    g_printerr ("Demux.\n");
    return -1;
  }

  if (!decoder) {
    g_printerr ("Decoder.\n");
    return -1;
  }

  if (!conv) {
    g_printerr ("conv.\n");
    return -1;
  }

  if (!rtpL24pay) {
    g_printerr ("rtpL24pay.\n");
    return -1;
  }

  if (!sink) {
    g_printerr ("sink.\n");
    return -1;
  }
  /* Set up the pipeline */
  /* we set the input filename to the source element */
  g_object_set (G_OBJECT (source), "location", "musica.ogg", NULL);

  /* we add a message handler */
  bus = gst_pipeline_get_bus (GST_PIPELINE (pipeline));
  bus_watch_id = gst_bus_add_watch (bus, bus_call, loop);
  gst_object_unref (bus);
  
  gst_bin_add_many (GST_BIN (pipeline), source, demuxer, decoder, conv, rtpL24pay, sink, NULL);

  /* we link the elements together */
  /* file-source -> ogg-demuxer ~> vorbis-decoder -> converter -> rtpL24pay -> udpsink */
  gst_element_link (source, demuxer);
  gst_element_link_many (decoder, conv, rtpL24pay, sink, NULL);
  g_signal_connect (demuxer, "pad-added", G_CALLBACK (on_pad_added), decoder);

  /* Set the pipeline to "playing" state*/
  g_print ("Now playing: %s\n", argv[1]);
  gst_element_set_state (pipeline, GST_STATE_PLAYING);

  /* Iterate */
  g_print ("Running...\n");
  g_main_loop_run (loop);

  /* Out of the main loop, clean up nicely */
  g_print ("Returned, stopping playback\n");
  gst_element_set_state (pipeline, GST_STATE_NULL);

  g_print ("Deleting pipeline\n");
  gst_object_unref (GST_OBJECT (pipeline));
  g_source_remove (bus_watch_id);
  g_main_loop_unref (loop);

  return 0;
}

/* 
RUN apk add --update --no-cache \
    bash \
    build-base \
    gstreamer gstreamer-dev \
    gst-plugins-base gst-plugins-base-dev \
    libgstreamer1.0-0 \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav \
    gstreamer1.0-tools \
    gstreamer1.0-x \
    gstreamer1.0-alsa \
    gstreamer1.0-gl \
    gstreamer1.0-gtk3 \
    gstreamer1.0-qt5 \
    gstreamer1.0-pulseaudio
*/