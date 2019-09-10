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
	- ID of the device

Lauch program
./camera /dev/video0 123456

To create de dockerfile

sudo docker build . -t alfa/src/camera_usb 

sudo docker run alfa/src/camera_usb /dev/video0 123456

To get the devices list
v4l2-ctl --list-devices

To get the specification of a specifica camera
v4l2-ctl --all -d /dev/video0

Paho-mqtt
https://www.embarcados.com.br/paho-mqtt-em-c-no-linux-embarcado/

*/

#include <string.h>
#include <signal.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <gst/gst.h>
#include "./paho.mqtt.c/src/MQTTClient.h"

static GMainLoop *loop;
static GstBus *bus;

static GstElement *pipeline, *src, *tee;
// static gboolean;

/*
* Defines
*/
/* Caso desejar utilizar outro broker MQTT, substitua o endereco abaixo */
#define MQTT_ADDRESS   "tcp://localhost:1883"

/* Substitua este por um ID unico em sua aplicacao */
#define CLIENTID       "MQTTCClientID"

/* Substitua aqui os topicos de publish e subscribe por topicos exclusivos de sua aplicacao */
char MQTT_PUBLISH_TOPIC[100] = "PUB_";
char MQTT_SUBSCRIBE_TOPIC[100] = "SUB_";

/*
*  Variaveis globais
*/
MQTTClient client;

/*
* Prototipos de funcao
*/
int addQueue(GstElement *pipeline, GstElement *tee, char* host, int port);
void publish(MQTTClient client, char* topic, char* payload);
int on_message(void *context, char *topicName, int topicLen, MQTTClient_message *message);

/*
* Implementacoes
*/

/* Funcao: publicacao de mensagens MQTT
 * Parametros: cleinte MQTT, topico MQTT and payload
 * Retorno: nenhum
*/
void publish(MQTTClient client, char* topic, char* payload) {
    MQTTClient_message pubmsg = MQTTClient_message_initializer;
    pubmsg.payload = payload;
    pubmsg.payloadlen = strlen(pubmsg.payload);
    pubmsg.qos = 2;
    pubmsg.retained = 0;
    MQTTClient_deliveryToken token;
    MQTTClient_publishMessage(client, topic, &pubmsg, &token);
    MQTTClient_waitForCompletion(client, token, 1000L);
}

/* Funcao: callback de mensagens MQTT recebidas e echo para o broker
 * Parametros: contexto, ponteiro para nome do topico da mensagem recebida, tamanho do nome do topico e mensagem recebida
 * Retorno : 1: sucesso (fixo / nao ha checagem de erro neste exemplo)
*/
int on_message(void *context, char *topicName, int topicLen, MQTTClient_message *message) {
    char* payload = message->payload;

	if (context) {}
	if (topicLen) {}

    /* Mostra a mensagem recebida */
    // printf("Mensagem recebida! \n\rTopico: %s Mensagem: %s\n", topicName, payload);
	// the message should be like IP;PORT localhost;5001
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
	addQueue(pipeline, tee, host, atoi(port));

    /* Faz echo da mensagem recebida */
    publish(client, MQTT_PUBLISH_TOPIC, payload);

    MQTTClient_freeMessage(&message);
    MQTTClient_free(topicName);
    return 1;
}

int message_cb (GstBus * bus, GstMessage * message, gpointer user_data)
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

  return 1;
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

int addQueue(GstElement *pipeline, GstElement *tee, char* host, int port) {
	// add a new queue to a tee :)
	GstElement *queue, *decodebin, *x264enc, *rtph264pay, *udpsink;
	queue = gst_element_factory_make("queue", NULL);
	decodebin = gst_element_factory_make("decodebin", NULL);
	x264enc = gst_element_factory_make("x264enc", NULL);
	rtph264pay = gst_element_factory_make("rtph264pay", NULL);
	udpsink = gst_element_factory_make("udpsink", NULL);

	g_object_set(udpsink, "host", host, NULL);
	g_object_set(udpsink, "port", port, NULL);

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

	// only start playing when the pad was add
	gst_element_set_state(pipeline, GST_STATE_PLAYING);

	return 1;
}

int main(int argc, char *argv[])
{

    if (argc != 3) {
      g_printerr ("Usage: SRC_ID DEVICE\n");
      return -1;
    }

	strcat(MQTT_SUBSCRIBE_TOPIC, argv[2]);
	strcat(MQTT_PUBLISH_TOPIC, argv[2]);

	// printf("\n\n %s \n\n",MQTT_SUBSCRIBE_TOPIC);

	int rc;
	MQTTClient_connectOptions conn_opts = MQTTClient_connectOptions_initializer;

	/* Inicializacao do MQTT (conexao & subscribe) */
	MQTTClient_create(&client, MQTT_ADDRESS, CLIENTID, MQTTCLIENT_PERSISTENCE_NONE, NULL);
	MQTTClient_setCallbacks(client, NULL, NULL, on_message, NULL);

	rc = MQTTClient_connect(client, &conn_opts);

	if (rc != MQTTCLIENT_SUCCESS)
	{
		printf("\n\rFalha na conexao ao broker MQTT. Erro: %d\n", rc);
		exit(-1);
	}

	MQTTClient_subscribe(client, MQTT_SUBSCRIBE_TOPIC, 0);

	// signal(SIGINT, sigintHandler);
	gst_init (&argc, &argv);

	pipeline = gst_pipeline_new(NULL);
	src = gst_element_factory_make("v4l2src", NULL);
	tee = gst_element_factory_make("tee", "tee");

	g_object_set(src, "device", argv[1], NULL);

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

	loop = g_main_loop_new(NULL, FALSE);

	bus = gst_pipeline_get_bus(GST_PIPELINE (pipeline));
	gst_bus_add_signal_watch(bus);
	g_signal_connect(G_OBJECT(bus), "message", G_CALLBACK(message_cb), NULL);
	gst_object_unref(GST_OBJECT(bus));

	g_print("Starting loop");
	g_main_loop_run(loop);

	return 0;
}