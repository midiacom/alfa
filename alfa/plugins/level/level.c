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
    udpsrc port=5005 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink

./level 123 ddd 172.17.0.1 1883

To create de dockerfile
docker build . -t alfa/plugin/udp_to_udp

docker run alfa/plugin/udp_to_udp 172.17.0.1 5001

export GST_DEBUG="*:3"
*/

#include <stdio.h>
#include <stdlib.h>
#include <gst/gst.h>
#include <glib.h>
#include <string.h>
#include <math.h>
#include <gst/gst.h>

#include "./mqtt/src/mqtt.h"
#include "./mqtt/include/posix_sockets.h"

#define GLIB_DISABLE_DEPRECATION_WARNINGS

/* setup a client */
struct mqtt_client client;
float sensitiveness;
char id_topic[50];

void publish_callback(void** unused, struct mqtt_response_publish *published);
void* client_refresher(void* client);
void exit_example(int status, int sockfd, pthread_t *client_daemon);

void exit_example(int status, int sockfd, pthread_t *client_daemon)
{
    if (sockfd != -1) close(sockfd);
    if (client_daemon != NULL) pthread_cancel(*client_daemon);
    exit(status);
}

void publish_callback(void** unused, struct mqtt_response_publish *published) 
{
    /* note that published->topic_name is NOT null-terminated (here we'll change it to a c-string) */
    char* topic_name = (char*) malloc(published->topic_name_size + 1);
    memcpy(topic_name, published->topic_name, published->topic_name_size);
    topic_name[published->topic_name_size] = '\0';

    printf("Received publish('%s'): %s\n", topic_name, (const char*) published->application_message);

    // printf("Mensagem recebida! \n\rTopico: %s Mensagem: %s\n", topicName, payload);
	// the message should be like IP;PORT localhost;5001
	char payload[100] = "";

	strcpy(payload, (char*) published->application_message);
	printf("%s", payload);
	char host[100] = "";
	char port[100] = ""; 
	int i = 0;
	for(i = 0; payload[i] != '\0';i++) {
		if (payload[i] == ';') {
			break;
		}
		host[i] = payload[i];
	}

	int k = 0;
	for(int j = i+1; payload[i] != '\0';j++) {
		port[k] = payload[j];
		k++;
		i++;
	}

	// printf("\n - %s",host);
	// printf("\n - %s\n",port);

	// addQueue(host, atoi(port));

    free(topic_name);
}

void* client_refresher(void* client)
{
    while(1) 
    {
        mqtt_sync((struct mqtt_client*) client);
        usleep(100000U);
    }
    return NULL;
}

static gboolean message_handler (GstBus * bus, GstMessage * message, gpointer data)
{
  if (bus || data) {}

  if (message->type == GST_MESSAGE_ELEMENT) {
    const GstStructure *s = gst_message_get_structure (message);
    const gchar *name = gst_structure_get_name (s);

    if (strcmp (name, "level") == 0) {
      gint channels;
      GstClockTime endtime;
      gdouble rms_dB, peak_dB, decay_dB;
      gdouble rms;
      const GValue *array_val;
      const GValue *value;
      GValueArray *rms_arr, *peak_arr, *decay_arr;
      gint i;

      if (!gst_structure_get_clock_time (s, "endtime", &endtime))
        g_warning ("Could not parse endtime");

      /* the values are packed into GValueArrays with the value per channel */
      array_val = gst_structure_get_value (s, "rms");
      rms_arr = (GValueArray *) g_value_get_boxed (array_val);

      array_val = gst_structure_get_value (s, "peak");
      peak_arr = (GValueArray *) g_value_get_boxed (array_val);

      array_val = gst_structure_get_value (s, "decay");
      decay_arr = (GValueArray *) g_value_get_boxed (array_val);

      /* we can get the number of channels as the length of any of the value
       * arrays */
      channels = rms_arr->n_values;
      //g_print ("endtime: %" GST_TIME_FORMAT ", channels: %d\n",GST_TIME_ARGS (endtime), channels);
      for (i = 0; i < channels; ++i) {

        // g_print ("channel %d\n", i);
        value = g_value_array_get_nth (rms_arr, i);
        rms_dB = g_value_get_double (value);

        value = g_value_array_get_nth (peak_arr, i);
        peak_dB = g_value_get_double (value);

        value = g_value_array_get_nth (decay_arr, i);
        decay_dB = g_value_get_double (value);
        // g_print ("    RMS: %f dB, peak: %f dB, decay: %f dB\n", rms_dB, peak_dB, decay_dB);

        /* converting from dB to normal gives us a value between 0.0 and 1.0 */
        rms = pow (10, rms_dB / 20);
        if (rms > sensitiveness) {
            char str[8];
            snprintf(str, 9, "%f", rms);
            // snprintf(str, 8, "%d", rms);
            //ftoa(rms,&str,6);
            g_print("Data published");
            mqtt_publish(&client, id_topic, str, 8, 1);
            // g_print (" ->   normalized rms value: %f\n", rms);
        }
      }
    }
  }
  /* we handled the message we want, and ignored the ones we didn't want.
   * so the core can unref the message for us */
  return TRUE;
}

int
main (int argc, char *argv[])
{

	if (argc != 5) {
      g_printerr ("Usage: deviceId Topic MQTT_SERVER_IP MQTT_SERVER_PORT \n");
      return -1;
    }

    sensitiveness = 0.02;

    strcpy(id_topic, argv[2]);

    // const char* addr  = "172.17.0.1";
    // const char* port  = "1883";

    const char* addr  = argv[4];
    const char* port  = argv[5];

    /* open the non-blocking TCP socket (connecting to the broker) */
    int sockfd = open_nb_socket(addr, port);

    if (sockfd == -1) {
        perror("Failed to open socket: ");
        exit_example(EXIT_FAILURE, sockfd, NULL);
    }

    
    uint8_t sendbuf[2048]; /* sendbuf should be large enough to hold multiple whole mqtt messages */
    uint8_t recvbuf[1024]; /* recvbuf should be large enough any whole mqtt message expected to be received */
    mqtt_init(&client, sockfd, sendbuf, sizeof(sendbuf), recvbuf, sizeof(recvbuf), publish_callback);
    mqtt_connect(&client, "subscribing_client", NULL, NULL, 0, NULL, NULL, 0, 400);

    /* check that we don't have any errors */
    if (client.error != MQTT_OK) {
        fprintf(stderr, "error: %s\n", mqtt_error_str(client.error));
        exit_example(EXIT_FAILURE, sockfd, NULL);
    }

    /* start a thread to refresh the client (handle egress and ingree client traffic) */
    pthread_t client_daemon;
    if(pthread_create(&client_daemon, NULL, client_refresher, &client)) {
        fprintf(stderr, "Failed to start client daemon.\n");
        exit_example(EXIT_FAILURE, sockfd, NULL);
    }

    /* subscribe */
    //mqtt_subscribe(&client, topic, 0);

//    mqtt_publish(&client, topic, "abc", 3, 1);

  GstElement *audiotestsrc, *audioconvert, *level, *fakesink;
  GstElement *pipeline;
  // GstCaps *caps;
  GstBus *bus;
  guint watch_id;
  GMainLoop *loop;

  gst_init (&argc, &argv);

  // caps = gst_caps_from_string ("audio/x-raw,channels=2");

  pipeline = gst_pipeline_new (NULL);
  g_assert (pipeline);
  
  //audiotestsrc = gst_element_factory_make ("audiotestsrc", NULL);
  // works
  // audiotestsrc = gst_element_factory_make ("alsasrc", NULL);
  // g_object_set(audiotestsrc, "device", "hw:0", NULL);  

   audiotestsrc = gst_element_factory_make ("udpsrc", NULL);
   g_object_set(audiotestsrc, "port", 10000, NULL);  

	GstCaps *caps = gst_caps_from_string ("audio/x-raw,format=S16LE,channels=2,rate=48000,layout=interleaved");	
	GstElement *capsfilter2 = gst_element_factory_make("capsfilter", NULL);
	g_object_set(capsfilter2, "caps", caps, NULL);

	GstElement *audioresample = gst_element_factory_make("audioresample", NULL);

  g_assert (audiotestsrc);
  audioconvert = gst_element_factory_make ("audioconvert", NULL);
  g_assert (audioconvert);
  level = gst_element_factory_make ("level", NULL);
  g_assert (level);
  fakesink = gst_element_factory_make ("fakesink", NULL);
  g_assert (fakesink);

  gst_bin_add_many (GST_BIN (pipeline), audiotestsrc, capsfilter2, audioresample, audioconvert, level,
      fakesink, NULL);
  if (!gst_element_link_many (audiotestsrc, capsfilter2, audioresample, audioconvert, NULL))
    g_error ("Failed to link audiotestsrc and audioconvert");
  if (!gst_element_link_filtered (audioconvert, level, caps))
    g_error ("Failed to link audioconvert and level");
  if (!gst_element_link (level, fakesink))
    g_error ("Failed to link level and fakesink");

  /* make sure we'll get messages */
  g_object_set (G_OBJECT (level), "post-messages", TRUE, NULL);
  /* run synced and not as fast as we can */
  g_object_set (G_OBJECT (fakesink), "sync", TRUE, NULL);

  bus = gst_element_get_bus (pipeline);
  watch_id = gst_bus_add_watch (bus, message_handler, NULL);

  gst_element_set_state (pipeline, GST_STATE_PLAYING);

  /* we need to run a GLib main loop to get the messages */
  loop = g_main_loop_new (NULL, FALSE);
  g_main_loop_run (loop);

  g_source_remove (watch_id);
  g_main_loop_unref (loop);
  return 0;
}








/*

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

    asprintf(&pipeline_string, "udpsrc port=5000 \
    ! udpsink host=%s port=%d", argv[1], atoi(argv[2]));

    pipeline = gst_parse_launch(pipeline_string, &err);

    gst_element_set_state(pipeline, GST_STATE_PLAYING);

    g_main_loop_run(loop);

    return 0;
}
*/