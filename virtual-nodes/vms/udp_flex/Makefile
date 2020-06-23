udp_flex: udp_flex.o mqtt.o mqtt_pal.o
	gcc udp_flex.o mqtt.o mqtt_pal.o -lpthread -oudp_flex

mqtt.o: mqtt.c
	gcc mqtt.c -c -I. -o mqtt.o

mqtt_pal.o: mqtt_pal.c
	gcc mqtt_pal.c -c -I. -o mqtt_pal.o

udp_flex.o: udpproxy.c mqtt.c mqtt_pal.c
	gcc udpproxy.c -c -I. -o udp_flex.o -lpthread