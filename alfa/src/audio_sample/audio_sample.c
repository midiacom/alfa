/*
SRC Name: Audio Sample

This SRC will grab the data from a MP3 file and send it via UDP

Pipeline: 

Send audio data
gst-launch-1.0 multifilesrc location=sample.mp3 loop=true \
    ! tee name=t \
    ! queue \
	! mpegaudioparse \
	! mpg123audiodec \
	! audioconvert \
	! audioresample \
	! capsfilter caps="audio/x-raw, rate=16000, channels=1, format=S16LE" \
	! audiomixer blocksize=320 \
	! udpsink host=localhost port=10000
	
gst-launch-1.0 multifilesrc location=sample.mp3 loop=true \
    ! tee name=t \
    ! queue \
	! mpegaudioparse \
	! mpg123audiodec \
	! audioconvert \
	! audioresample \
	! capsfilter caps="audio/x-raw, rate=16000, channels=1, format=S16LE" \
	! audiomixer blocksize=320 \
	! udpsink host=localhost port=10000 \
	t. \
	! queue \
	! mpegaudioparse \
	! mpg123audiodec \
	! audioconvert \
	! audioresample \
	! capsfilter caps="audio/x-raw, rate=16000, channels=1, format=S16LE" \
	! audiomixer blocksize=320 \
	! udpsink host=localhost port=10005

// Queue only before udpsink
gst-launch-1.0 multifilesrc location=sample.mp3 loop=true \
	! mpegaudioparse \
	! mpg123audiodec \
	! audioconvert \
	! audioresample \
	! capsfilter caps="audio/x-raw, rate=16000, channels=1, format=S16LE" \
	! audiomixer blocksize=320 \
    ! tee name=t \
    ! queue \
	! udpsink host=localhost port=10000 \
	t. \
	! queue \
	! udpsink host=localhost port=10005

VMS udp_to_udp
gst-launch-1.0 \
    udpsrc port=10000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! udpsink host=localhost port=10001

Consume audio data 
gst-launch-1.0 -v udpsrc port=10001 \
	! rawaudioparse use-sink-caps=false format=pcm pcm-format=s16le sample-rate=16000 num-channels=1 \
	! queue \
	! audioconvert \
	! audioresample \
	! autoaudiosink

Parameters:
	- id of the device

Lauch program
./audio_sample 123456

To create de dockerfile

docker build . -t alfa/src/audio_sample

docker run alfa/src/audio_sample 123456

MQQT Message
172.17.0.1;10000 send data do host machine at port 50000
172.17.0.1;10001 send data do host machine at port 50001
*/

#include <string.h>
#include <signal.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <gst/gst.h>

#include "./mqtt/src/mqtt.h"
#include "./mqtt/include/posix_sockets.h"

static GMainLoop *loop;
static GstBus *bus;

static GstElement *pipeline, *src, *my_tee;

int addQueue(char *host, int port);
void publish_callback(void **unused, struct mqtt_response_publish *published);
void *client_refresher(void *client);
void exit_example(int status, int sockfd, pthread_t *client_daemon);

void exit_example(int status, int sockfd, pthread_t *client_daemon)
{
	if (sockfd != -1)
		close(sockfd);
	if (client_daemon != NULL)
		pthread_cancel(*client_daemon);
	exit(status);
}

void publish_callback(void **unused, struct mqtt_response_publish *published)
{
	/* note that published->topic_name is NOT null-terminated (here we'll change it to a c-string) */
	char *topic_name = (char *)malloc(published->topic_name_size + 1);
	memcpy(topic_name, published->topic_name, published->topic_name_size);
	topic_name[published->topic_name_size] = '\0';

	printf("Received publish('%s'): %s\n", topic_name, (const char *)published->application_message);

	// printf("Mensagem recebida! \n\rTopico: %s Mensagem: %s\n", topicName, payload);
	// the message should be like IP;PORT localhost;5001
	char payload[100] = "";

	strcpy(payload, (char *)published->application_message);
	printf("%s", payload);
	char host[100] = "";
	char port[100] = "";
	int i = 0;
	for (i = 0; payload[i] != '\0'; i++)
	{
		if (payload[i] == ';')
		{
			break;
		}
		host[i] = payload[i];
	}

	int k = 0;
	for (int j = i + 1; payload[i] != '\0'; j++)
	{
		port[k] = payload[j];
		k++;
		i++;
	}

	// printf("\n - %s",host);
	// printf("\n - %s\n",port);

	addQueue(host, atoi(port));

	free(topic_name);
}

void *client_refresher(void *client)
{
	while (1)
	{
		mqtt_sync((struct mqtt_client *)client);
		usleep(100000U);
	}
	return NULL;
}

int message_cb(GstBus *bus, GstMessage *message, gpointer user_data)
{
	if (user_data)
	{
	}
	if (bus)
	{
	}
	switch (GST_MESSAGE_TYPE(message))
	{
	case GST_MESSAGE_ERROR:
	{
		GError *err = NULL;
		gchar *name, *debug = NULL;

		name = gst_object_get_path_string(message->src);
		gst_message_parse_error(message, &err, &debug);

		g_printerr("ERROR: from element %s: %s\n", name, err->message);
		if (debug != NULL)
			g_printerr("Additional debug info:\n%s\n", debug);

		g_error_free(err);
		g_free(debug);
		g_free(name);

		g_main_loop_quit(loop);
		break;
	}
	case GST_MESSAGE_WARNING:
	{
		GError *err = NULL;
		gchar *name, *debug = NULL;

		name = gst_object_get_path_string(message->src);
		gst_message_parse_warning(message, &err, &debug);

		g_printerr("ERROR: from element %s: %s\n", name, err->message);
		if (debug != NULL)
			g_printerr("Additional debug info:\n%s\n", debug);

		g_error_free(err);
		g_free(debug);
		g_free(name);
		break;
	}
	case GST_MESSAGE_EOS:
	{
		g_print("Got EOS\n");
		g_main_loop_quit(loop);
		gst_element_set_state(pipeline, GST_STATE_NULL);
		g_main_loop_unref(loop);
		gst_object_unref(pipeline);
		exit(0);
		break;
	}
	default:
		break;
	}

	return 1;
}

int sigintHandler(int unused)
{
	if (unused)
	{
	}
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

int addQueue(char *host, int port)
{
	printf("\n --------------");
	printf("\n%s - %d",host, port);
	printf("\n --------------");

	// add a new queue to a tee :)
	// printf("\n 1 ");

	GstElement *queue, *mpegaudioparse, *mpg123audiodec, *audioconvert, *audioresample, *audiomixer, *udpsink;
	GstCaps *caps = gst_caps_from_string ("audio/x-raw, rate=16000, channels=1, format=S16LE");	

	queue = gst_element_factory_make("queue", NULL);
	mpegaudioparse = gst_element_factory_make("mpegaudioparse", NULL);
	mpg123audiodec = gst_element_factory_make("mpg123audiodec", NULL);
	audioconvert = gst_element_factory_make("audioconvert", NULL);
	audioresample = gst_element_factory_make("audioresample", NULL);
	GstElement *capsfilter2 = gst_element_factory_make("capsfilter", NULL);

	audiomixer = gst_element_factory_make("audiomixer", NULL);
	udpsink = gst_element_factory_make("udpsink", NULL);

	// g_object_set(audiomixer, "blocksize", 320, NULL);
	g_object_set(capsfilter2, "caps", caps, NULL);
	g_object_set(udpsink, "host", host, NULL);
	g_object_set(udpsink, "port", port, NULL);

	if (!queue || !mpegaudioparse || !mpg123audiodec || !audioconvert || !audioresample || !capsfilter2 || !audiomixer || !udpsink )
	{
		g_printerr("Not all elements could be created 1.\n");
		return -1;
	}

	gst_bin_add_many(GST_BIN(pipeline), queue, mpegaudioparse, mpg123audiodec, audioconvert, audioresample, capsfilter2, audiomixer, udpsink, NULL);

	// link the tee -> queue -> decodebin
	if (!gst_element_link_many(my_tee, queue, mpegaudioparse, mpg123audiodec, audioconvert, audioresample, capsfilter2, audiomixer, udpsink, NULL))	{
		g_error("Failed to link elements A");
		return -1;
	}

	// only start playing when the pad was add
	gst_element_set_state(pipeline, GST_STATE_PLAYING);

	GST_DEBUG_BIN_TO_DOT_FILE(GST_BIN(pipeline), GST_DEBUG_GRAPH_SHOW_ALL, "pipeline");

	return 1;
}

int main(int argc, char *argv[])
{

	if (argc != 2)
	{
		g_printerr("Usage: deviceId\n");
		return -1;
	}

	const char *addr = "172.17.0.1";
	const char *port = "1883";
	const char *topic = argv[1]; // this is the ID of

	/* open the non-blocking TCP socket (connecting to the broker) */
	int sockfd = open_nb_socket(addr, port);

	if (sockfd == -1)
	{
		perror("Failed to open socket: ");
		exit_example(EXIT_FAILURE, sockfd, NULL);
	}

	/* setup a client */
	struct mqtt_client client;
	uint8_t sendbuf[2048]; /* sendbuf should be large enough to hold multiple whole mqtt messages */
	uint8_t recvbuf[1024]; /* recvbuf should be large enough any whole mqtt message expected to be received */
	mqtt_init(&client, sockfd, sendbuf, sizeof(sendbuf), recvbuf, sizeof(recvbuf), publish_callback);
	mqtt_connect(&client, "subscribing_client", NULL, NULL, 0, NULL, NULL, 0, 400);

	/* check that we don't have any errors */
	if (client.error != MQTT_OK)
	{
		fprintf(stderr, "error: %s\n", mqtt_error_str(client.error));
		exit_example(EXIT_FAILURE, sockfd, NULL);
	}

	/* start a thread to refresh the client (handle egress and ingree client traffic) */
	pthread_t client_daemon;
	if (pthread_create(&client_daemon, NULL, client_refresher, &client))
	{
		fprintf(stderr, "Failed to start client daemon.\n");
		exit_example(EXIT_FAILURE, sockfd, NULL);
	}

	/* subscribe */
	mqtt_subscribe(&client, topic, 0);

	// signal(SIGINT, sigintHandler);
	gst_init(&argc, &argv);

	pipeline = gst_pipeline_new(NULL);
	src = gst_element_factory_make("multifilesrc", NULL);
	my_tee = gst_element_factory_make("tee", "tee");

	g_object_set(src, "location", "sample.mp3", NULL);

	if (!pipeline || !src || !my_tee)
	{
		g_error("Failed to create elements");
		return -1;
	}

	loop = g_main_loop_new(NULL, FALSE);

	bus = gst_pipeline_get_bus(GST_PIPELINE(pipeline));
	gst_bus_add_signal_watch(bus);
	g_signal_connect(G_OBJECT(bus), "message", G_CALLBACK(message_cb), NULL);
	gst_object_unref(GST_OBJECT(bus));

	gst_bin_add_many(GST_BIN(pipeline), src, my_tee, NULL);
	if (gst_element_link_many (src, my_tee, NULL) != TRUE){
		return -1;
	}	

	/* start publishing the time */
	printf("%s listening for '%s' messages.\n", argv[0], topic);
	printf("Press CTRL-D to exit.\n\n");

	loop = g_main_loop_new(NULL, FALSE);

	bus = gst_pipeline_get_bus(GST_PIPELINE(pipeline));
	gst_bus_add_signal_watch(bus);
	g_signal_connect(G_OBJECT(bus), "message", G_CALLBACK(message_cb), NULL);
	gst_object_unref(GST_OBJECT(bus));

	g_print("Starting loop");
	g_main_loop_run(loop);

	/* block */
	while (fgetc(stdin) != EOF)
		;

	return 0;
}