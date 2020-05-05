PROGRAMS= noise_detector
MODULES= glib-2.0 gstreamer-1.0
CFLAGS=mqtt/src/mqtt.c mqtt/src/mqtt_pal.c -l pthread -g -Wall -Wextra `pkg-config --cflags $(MODULES)` -D _GNU_SOURCE
LDLIBS= `pkg-config --libs $(MODULES)` -lm
all: $(PROGRAMS)
clean:
	-rm -f $(PROGRAMS)
.PHONY: all clean