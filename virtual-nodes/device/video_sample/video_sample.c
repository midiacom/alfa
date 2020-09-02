/*
Plugin Name: Sample Video

It will generate the patterns video sample test, it can be used to test VMS 
or to test some APP

Pipeline: 
Generate the patterns video 

smpte (0) – SMPTE 100%% color bars
snow (1) – Random (television snow)
black (2) – 100%% Black
white (3) – 100%% White
red (4) – Red
green (5) – Green
blue (6) – Blue
checkers-1 (7) – Checkers 1px
checkers-2 (8) – Checkers 2px
checkers-4 (9) – Checkers 4px
checkers-8 (10) – Checkers 8px
circular (11) – Circular
blink (12) – Blink
smpte75 (13) – SMPTE 75%% color bars
zone-plate (14) – Zone plate
gamut (15) – Gamut checkers
chroma-zone-plate (16) – Chroma zone plate
solid-color (17) – Solid color
ball (18) – Moving ball
smpte100 (19) – SMPTE 100%% color bars
bar (20) – Bar
pinwheel (21) – Pinwheel
spokes (22) – Spokes
gradient (23) – Gradient
colors (24) – Colors

gst-launch-1.0  videotestsrc pattern=ball \
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
    ! udpsink host=localhost port=5001

Show the video
gst-launch-1.0 \
    udpsrc port=5000 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink

Parameters:
	- id of the device
    - type of video pattern

Lauch program
./video_sample 123 20

To create de dockerfile

docker build . -t alfa/src/video_sample

docker run alfa/src/video_sample 123456 1

MQQT Message
172.17.0.1;5000 send data do host machine at port 5000
172.17.0.1;5001 send data do host machine at port 5001

172.17.0.1;15001;0463315001;A
172.17.0.1;15002;0463315000;A

172.17.0.1;15001;0463315001;R
172.17.0.1;15002;0463315000;R

./video_sample 046a3d3bdaa 18

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

int addQueue(char* host, int port, char* dockerId);
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

static void cb_new_pad(GstElement *element, GstPad *pad, gpointer data)
{
	gchar *name;
	GstElement *other = data;
	name = gst_pad_get_name(pad);
	g_print("A new pad %s was created for %s\n", name, gst_element_get_name(element));
	g_free(name);
	g_print("element %s will be linked to %s\n",
			gst_element_get_name(element),
			gst_element_get_name(other));
	gst_element_link(element, other);
}

void publish_callback(void **unused, struct mqtt_response_publish *published)
{
    /* note that published->topic_name is NOT null-terminated (here we'll change it to a c-string) */
    char* topic_name = (char*) malloc(published->topic_name_size + 1);
    memcpy(topic_name, published->topic_name, published->topic_name_size);
    topic_name[published->topic_name_size] = '\0';

    printf("Received publish('%s'): %s\n", topic_name, (const char*) published->application_message);

	// the message should be like IP;PORT localhost;5001
	char payload[100] = "";

	strcpy(payload, (char*) published->application_message);
	printf("%s", payload);
	char host[100] = "";
	char port[100] = ""; 
	char dockerId[12] = ""; // used to identify the pipeline to add and remove

	int i = 0;
	for(i = 0; payload[i] != '\0';i++) {
		if (payload[i] == ';') {
			break;
		}
		host[i] = payload[i];
	}

	int k = 0;
	for(i = i+1; payload[i] != '\0';i++) {
		if (payload[i] == ';') {
			break;
		}
		port[k] = payload[i];
		k++;
	}

	k = 0;
	for(i = i+1; payload[i] != '\0';i++) {
		if (payload[i] == ';') {
			break;
		}
		dockerId[k] = payload[i];
		k++;
	}

	char action = payload[i+1];

	g_printerr("\n(%s) \n(%s) \n(%s) \n(%c)\n",host, port, dockerId, action);

	// R means stop and remove
	if ( (char) action == 'R') {
		g_printerr("\n Unbinding SRC from VMS %s ... \n",dockerId);
		GstElement *aux = gst_bin_get_by_name(GST_BIN(pipeline), dockerId);
		g_printerr("\n Executing the unbind \n");
		// the valve element can be setted drop to true, it will stop the 
		// processing of the stream, setting it to false and the process 
		// will start again
		g_object_set(aux, "drop", TRUE, NULL);
	} else {
		g_printerr("\n Executing binding \n");
		addQueue(host, atoi(port), dockerId);
	}

    free(topic_name);
}

int addQueue(char *host, int port, char* dockerId)
{
	GstElement *queue, *valve, *decodebin, *x264enc, *rtph264pay, *udpsink;
	GstElement *aux = gst_bin_get_by_name(GST_BIN(pipeline), dockerId);
	// if there is a element with the same name it means that it was 'paused'
	if (aux != NULL) {
		// set drop to FALSE will start to sending the stream again
		g_object_set(aux, "drop", FALSE, NULL);
		return 0;
	}
	// printf("\n -------------- \n");
	// printf("\n%s - %d",host, port);
	// printf("\n -------------- \n");
	// add a new queue to a tee :)
	valve = gst_element_factory_make("valve", NULL);
	queue = gst_element_factory_make("queue", NULL);
	decodebin = gst_element_factory_make("decodebin", NULL);
	x264enc = gst_element_factory_make("x264enc", NULL);
	rtph264pay = gst_element_factory_make("rtph264pay", NULL);
	udpsink = gst_element_factory_make("udpsink", NULL);

	// g_object_set(valve, "name", dockerId, NULL);
	// printf("\n-------- %s", dockerId);
	// gst_object_set_name(GST_OBJECT(valve), "070005000");
	gst_object_set_name(GST_OBJECT(valve), dockerId);
	// g_object_set(valve, "drop", FALSE, NULL);

	g_object_set(udpsink, "host", host, NULL);
	g_object_set(udpsink, "port", port, NULL);

	g_object_set(queue, "max-size-bytes", 65536, NULL);
	g_object_set(queue, "max-size-buffers", 65536, NULL);
	g_object_set(queue, "max-size-time", 65536, NULL);

	if (!valve || !queue || !decodebin || !x264enc || !rtph264pay || !udpsink)
	{
		g_printerr("Not all elements could be created.\n");
		return -1;
	}

	gst_bin_add_many(GST_BIN(pipeline), valve, queue, decodebin, x264enc, rtph264pay, udpsink, NULL);

	// link the tee -> queue -> decodebin
	if (!gst_element_link_many(my_tee, valve, queue, decodebin, NULL))
	{
		g_error("Failed to link elements A");
		return -1;
	}

	// link the x264 -> rtp -> udpsink
	if (!gst_element_link_many(x264enc, rtph264pay, udpsink, NULL))
	{
		g_error("Failed to link elements B");
		return -1;
	}

	// quen de decodebin has something to play the pad will be linked betewen decodebin and x264
	g_signal_connect(decodebin, "pad-added", G_CALLBACK(cb_new_pad), x264enc);

	// only start playing when the pad was add
	gst_element_set_state(pipeline, GST_STATE_PLAYING);

	GST_DEBUG_BIN_TO_DOT_FILE(GST_BIN(pipeline), GST_DEBUG_GRAPH_SHOW_ALL, "pipeline");

	return 1;
}

int main(int argc, char *argv[])
{
	if (argc != 3)
	{
		g_printerr("Usage: deviceId pattern\n");
		return -1;
	}

	const char *addr = "mosquitto";
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
	mqtt_connect(&client, argv[1], NULL, NULL, 0, NULL, NULL, 0, 400);

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
	src = gst_element_factory_make("videotestsrc", NULL);
	my_tee = gst_element_factory_make("tee", "tee");

	g_object_set(src, "pattern", atoi(argv[2]), NULL);
	g_object_set(src, "horizontal-speed", 2, NULL);

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