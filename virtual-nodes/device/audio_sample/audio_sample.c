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
	
Correct example
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

docker build . -t alfa/device/audio_sample

docker run alfa/src/audio_sample 123456

MQQT Message
172.17.0.1;10000 send data do host machine at port 50000
172.17.0.1;10001 send data do host machine at port 50001
172.17.0.1;10002 send data do host machine at port 50001
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
		g_printerr("\n Executing the unbind (%s) \n",dockerId);
		// the valve element can be setted drop to true, it will stop the 
		// processing of the stream, setting it to false and the process 
		// will start again

		gst_element_set_state(GST_ELEMENT(pipeline), GST_STATE_NULL);
		g_object_set(GST_OBJECT(aux), "drop", TRUE, NULL);
		gst_element_set_state(pipeline, GST_STATE_PLAYING);				

	} else {
		g_printerr("\n Executing binding \n");
		addQueue(host, atoi(port), dockerId);
	}

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

/*
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
*/

int addQueue(char* host, int port, char* dockerId) {
	// printf("\n --------------");
	// sprintf("\n%s - %d",host, port);
	// printf("\n --------------");

	// add a new queue to a tee :)
	// printf("\n 1 ");

	GstElement *aux = gst_bin_get_by_name(GST_BIN(pipeline), dockerId);
	// if there is a element with the same name it means that it was 'paused'
	if (aux != NULL) {
		g_printerr("\n allready exist, only open the vale. \n");
		// set drop to FALSE will start to sending the stream again
		g_object_set(aux, "drop", FALSE, NULL);

		gst_element_set_state(GST_ELEMENT(pipeline), GST_STATE_NULL);
		gst_element_set_state(pipeline, GST_STATE_PLAYING);		

		return 0;
	}
	printf("\n New connection");

	GstElement *valve, *queue, *mpegaudioparse, *mpg123audiodec, *audioconvert, *audioresample, *audiomixer, *udpsink;
	GstCaps *caps = gst_caps_from_string ("audio/x-raw, rate=16000, channels=1, format=S16LE");	

	valve = gst_element_factory_make("valve", NULL);
	queue = gst_element_factory_make("queue", NULL);
	mpegaudioparse = gst_element_factory_make("mpegaudioparse", NULL);
	mpg123audiodec = gst_element_factory_make("mpg123audiodec", NULL);
	audioconvert = gst_element_factory_make("audioconvert", NULL);
	audioresample = gst_element_factory_make("audioresample", NULL);
	audiomixer = gst_element_factory_make("audiomixer", NULL);
	udpsink = gst_element_factory_make("udpsink", NULL);

	GstElement *capsfilter2 = gst_element_factory_make("capsfilter", NULL);

	if (!valve || !queue || !mpegaudioparse || !mpg123audiodec || !audioconvert || !audioresample || !capsfilter2 || !audiomixer || !udpsink )
	{
		g_printerr("Not all elements could be created 1.\n");
		return -1;
	}


	gst_object_set_name(GST_OBJECT(valve), dockerId);
	g_object_set(valve, "drop", FALSE, NULL);

	// g_object_set(audiomixer, "blocksize", 320, NULL);
	g_object_set(capsfilter2, "caps", caps, NULL);
	
	g_object_set(udpsink, "host", host, NULL);
	g_object_set(udpsink, "port", port, NULL);
	g_object_set(udpsink, "async", FALSE, NULL);

	
	gst_bin_add_many(GST_BIN(pipeline), valve, queue, mpegaudioparse, mpg123audiodec, audioconvert, audioresample, capsfilter2, audiomixer, udpsink, NULL) ;

	// link the tee -> queue -> decodebin
	/*if (!gst_element_link_many(my_tee, queue, mpegaudioparse, mpg123audiodec, audioconvert, audioresample, capsfilter2, audiomixer, udpsink, NULL))	{
		g_error("Failed to link elements B");
		return -1;
	}
	*/

	if (!gst_element_link_many(my_tee, valve, queue, mpegaudioparse, mpg123audiodec, audioconvert, audioresample, capsfilter2, audiomixer, udpsink, NULL))	{
		g_error("Failed to link elements B");
		return -1;
	}

/*
	GstPadTemplate *tee_src_pad_template = gst_element_class_get_pad_template (GST_ELEMENT_GET_CLASS (my_tee), "src_%u");
	GstPad *tee_pad = gst_element_request_pad (my_tee, tee_src_pad_template, NULL, NULL);
	GstPad *q_pad = gst_element_get_static_pad (queue, "sink");

	if (gst_pad_link (tee_pad, q_pad) != GST_PAD_LINK_OK ){
		g_critical ("Tee for q1 could not be linked.\n");
		gst_object_unref (pipeline);
		return 0;
	}
*/
	/* idea about the src and sink was not linkded
	GstPad *sinkpad;
	GstPad *teepad;
    GstPadTemplate *templ;

	templ = gst_element_class_get_pad_template(GST_ELEMENT_GET_CLASS(my_tee), "src_%u");
    teepad = gst_element_request_pad(my_tee, templ, NULL, NULL);

	printf("-------------------");
	printf("teepad %s",teepad);
	printf("-------------------");
	*/

	// only start playing when the pad was add
	// gst_element_set_state(udpsink, GST_STATE_PLAYING);
	// gst_element_set_state(audiomixer, GST_STATE_PLAYING);
	// gst_element_set_state(capsfilter2, GST_STATE_PLAYING);
	// gst_element_set_state(audioresample, GST_STATE_PLAYING);
	// gst_element_set_state(audioconvert, GST_STATE_PLAYING);
	// gst_element_set_state(mpg123audiodec, GST_STATE_PLAYING);
	// gst_element_set_state(mpegaudioparse, GST_STATE_PLAYING);
	// gst_element_set_state(queue, GST_STATE_PLAYING);

	// quen de decodebin has something to play the pad will be linked betewen decodebin and x264
	// g_signal_connect(mpg123audiodec, "pad-added", G_CALLBACK(cb_new_pad), audioconvert);	

 	gst_element_set_state(GST_ELEMENT(pipeline), GST_STATE_NULL);
	gst_element_set_state(pipeline, GST_STATE_PLAYING);

	// gst_element_sync_state_with_parent(udpsink);
	// gst_element_sync_state_with_parent(audiomixer);
	// gst_element_sync_state_with_parent(capsfilter2);
	// gst_element_sync_state_with_parent(audioresample);
	// gst_element_sync_state_with_parent(audioconvert);
	// gst_element_sync_state_with_parent(mpg123audiodec);
	// gst_element_sync_state_with_parent(mpegaudioparse);
	// gst_element_sync_state_with_parent(queue);

	// gst_element_set_state(pipeline, GST_STATE_CHANGE_PLAYING_TO_PLAYING);

	// this is to create the dot file
	GST_DEBUG_BIN_TO_DOT_FILE(GST_BIN(pipeline), GST_DEBUG_GRAPH_SHOW_VERBOSE, "pipeline");

	// g_printerr("terminou");

	return 1;
}

int main(int argc, char *argv[])
{

	if (argc != 3)
	{
		g_printerr("Usage: deviceId mp3_file_name\n");
		return -1;
	}

	const char *addr = "mosquitto";
	const char *port = "1883";
	const char *topic = argv[1]; // this is the ID of
	const char *mp3file = argv[2]; // this is the ID of

	printf("-----");
	printf("%s\n", topic);
	printf("%s\n", mp3file);


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
	src = gst_element_factory_make("multifilesrc", NULL);
	my_tee = gst_element_factory_make("tee", "tee");

	g_object_set(src, "location", mp3file, NULL);

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