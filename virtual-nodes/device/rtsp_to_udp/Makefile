PROGRAMS= rtsp_to_udp
MODULES= glib-2.0 gstreamer-1.0
CFLAGS= mqtt/src/mqtt.c mqtt/src/mqtt_pal.c -l pthread -g -Wall -Wextra `pkg-config --cflags $(MODULES)` -D _GNU_SOURCE -Wno-unused-parameter -Wno-unused-variable -Wno-duplicate-decl-specifier -Wmisleading-indentation
LDLIBS= `pkg-config --libs $(MODULES)` 
all: $(PROGRAMS)
clean:
	-rm -f $(PROGRAMS)
.PHONY: all clean