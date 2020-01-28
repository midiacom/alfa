/*
Plugin Name: UDP Video Crop

What it do: Gets an udp video and crop it TOP LEFT RIGHT BOTTOM

Parameters:
    - DEST_IP:
    - DEST_PORT: 

Lauch program
./udp_to_udp localhost 5000

Pipeline to send video (From audio mic)
gst-launch-1.0 alsasrc device=hw:0 \
  ! tee name=t \
  ! queue \
  ! audioconvert \
  ! audioresample \
  ! audio/x-raw,format=S16LE,channels=2,rate=48000,layout=interleaved \
  ! udpsink host=localhost port=5000

gst-launch-1.0 alsasrc device=hw:0 \
  ! tee name=t \
  ! queue \
  ! audioconvert \
  ! audioresample \
  ! audio/x-raw,format=S16LE,channels=2,rate=48000,layout=interleaved \
  ! udpsink host=35.153.160.117 port=5000

./noise_detector 0.05 altola 172.17.0.1 1883
./start.sh 0.01 alto 172.17.0.1 1883

To create de dockerfile./noise_detector 0.01 altola 172.17.0.1 1883
docker build . -t alfa/plugin/noise_detector

docker run alfa/plugin/noise_detector 0.05 alert 172.17.0.1 1883
docker run --net=host alfa/plugin/noise_detector 0.03 aaa test.mosquitto.org 1883

export GST_DEBUG="*:3"
*/

#include <stdio.h>
#include <stdlib.h>
#include <gst/gst.h>
#include <glib.h>
#include <string.h>
#include <math.h>
#include <gst/gst.h>
#include <sys/time.h>

#include "./mqtt/src/mqtt.h"
#include "./mqtt/include/posix_sockets.h"
#include <time.h>

#define GLIB_DISABLE_DEPRECATION_WARNINGS

/* setup a client */
struct mqtt_client client;
float sensitiveness;
char id_topic[50];
int num_det = 0;
long long int start_time = 0LL;

char* mqtt_server_addr;
char* mqtt_server_port;
char* c_name;

void publish_callback(void** unused, struct mqtt_response_publish *published);
void* client_refresher(void* client);
void exit_example(int status, int sockfd, pthread_t *client_daemon);

#define ASCII_START 65
#define ASCII_END 90

char* client_name(int size) {
    int i;
    srand(time(0)); 
    char *res = malloc(size + 1);
    for(i = 0; i < size; i++) {
        res[i] = (char) (rand()%(ASCII_END-ASCII_START))+ASCII_START;
    }
    res[i] = '\0';
    return res;
}

void exit_example(int status, int sockfd, pthread_t *client_daemon)
{
    if (sockfd != -1) close(sockfd);
    if (client_daemon != NULL) pthread_cancel(*client_daemon);
    exit(status);
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

long long current_timestamp() {
	struct timeval currentTime;
	gettimeofday(&currentTime, NULL);
	return currentTime.tv_sec * (int)1e6 + currentTime.tv_usec;
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

      //printf("\n%f\n",endtime);

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
          char str[10];
          snprintf(str, 10, "%f", rms);
          // g_print("\n Data published");
          // g_print("\n %s %s",id_topic, str);
          long long int now = current_timestamp();
          long long int diff = now - start_time;
          if (diff > 600000) {
            num_det++;
            // g_print("\n%d \t %03lld",num_det,diff);
            start_time = current_timestamp();
          }
          
          //mqtt_publish(&client, id_topic, str, strlen(str)+1, MQTT_PUBLISH_QOS_0);

          /////////////////////////////////////////////  
          mqtt_publish(&client, id_topic, str, strlen(str) + 1, MQTT_PUBLISH_QOS_0);
          if (client.error != MQTT_OK) {              
              fprintf(stderr, "error a: %s\n", mqtt_error_str(client.error));

              // MQTT client
              int sockfd = open_nb_socket(mqtt_server_addr, mqtt_server_port);
              if (sockfd == -1) {
                  perror("Failed to open socket: ");
                  exit_example(EXIT_FAILURE, sockfd, NULL);
              }
              uint8_t sendbuf[2048]; 
              uint8_t recvbuf[1024]; 
              mqtt_init(&client, sockfd, sendbuf, sizeof(sendbuf), recvbuf, sizeof(recvbuf), NULL);              
              mqtt_connect(&client, c_name, NULL, NULL, 0, NULL, NULL, 0, 400);
              if (client.error != MQTT_OK) {
                  fprintf(stderr, "error b: %s\n", mqtt_error_str(client.error));
                  exit_example(EXIT_FAILURE, sockfd, NULL);
              }
              pthread_t client_daemon;
              if(pthread_create(&client_daemon, NULL, client_refresher, &client)) {
                  fprintf(stderr, "Failed to start client daemon.\n");
                  exit_example(EXIT_FAILURE, sockfd, NULL);
              }           
              // tenta novamente
              mqtt_publish(&client, id_topic, str, strlen(str) + 1, MQTT_PUBLISH_QOS_0);   
          }
          // close(sockfd);
          // pthread_cancel(client_daemon);
          /////////////////////////////////////////////
        }
      }
    }
  }
  /* we handled the message we want, and ignored the ones we didn't want.
   * so the core can unref the message for us */
  return TRUE;
}

main (int argc, char *argv[])
{
  start_time = current_timestamp();
  // g_print("\n Start Time: %03ld", start_time);
  // g_print("\n-----------------\n");

  c_name = client_name(5);

	if (argc != 5) {
      g_printerr ("Usage: Sensitiveness Topic MQTT_SERVER_IP MQTT_SERVER_PORT \n");
      return -1;
    }

    sensitiveness = atof(argv[1]);

    strcpy(id_topic, argv[2]);

    mqtt_server_addr  = argv[3];
    mqtt_server_port  = argv[4];

  // MQTT client
  int sockfd = open_nb_socket(mqtt_server_addr, mqtt_server_port);
  if (sockfd == -1) {
      perror("Failed to open socket: ");
      exit_example(EXIT_FAILURE, sockfd, NULL);
  }
  uint8_t sendbuf[2048]; 
  uint8_t recvbuf[1024]; 

  mqtt_init(&client, sockfd, sendbuf, sizeof(sendbuf), recvbuf, sizeof(recvbuf), NULL);
  mqtt_connect(&client, c_name, NULL, NULL, 0, NULL, NULL, 0, 400);
  if (client.error != MQTT_OK) {
      fprintf(stderr, "error c: %s\n", mqtt_error_str(client.error));
      exit_example(EXIT_FAILURE, sockfd, NULL);
  }
  pthread_t client_daemon;
  if(pthread_create(&client_daemon, NULL, client_refresher, &client)) {
      fprintf(stderr, "Failed to start client daemon.\n");
      exit_example(EXIT_FAILURE, sockfd, NULL);
  }

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
   g_object_set(audiotestsrc, "port", 5000, NULL);  

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
