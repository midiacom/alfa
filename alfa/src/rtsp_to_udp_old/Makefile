PROGRAMS= rtsp_to_udp_sample
MODULES= glib-2.0 gstreamer-1.0
CFLAGS= -g -Wall -Wextra `pkg-config --cflags $(MODULES)` -D _GNU_SOURCE
LDLIBS= `pkg-config --libs $(MODULES)`
all: $(PROGRAMS)
clean:
	-rm -f $(PROGRAMS)
.PHONY: all clean