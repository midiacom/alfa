/*
 * @author: Nilson Luís Damasceno
 * @date: 2020-05-03
 * 
 */
#include <stdio.h>
#include <stdlib.h>

#include <sys/types.h>
#include <unistd.h>

#include <sys/socket.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <errno.h>

#include <string.h>

#include <sys/time.h>
#include <time.h>

#include "mqtt.h"
#include <pthread.h>

//****************************************************************************************
//
//                                     KEY CONSTANTS
//
//****************************************************************************************
#define MIN_DATAGRAM_BUFFER_SIZE    576
#define MAX_DATAGRAM_SIZE           65536
#define WORK_BUFFER_SIZE            (2 * (MAX_DATAGRAM_SIZE))

#define HEADER_RESERVATION          64

#define LOCAL_SOCKET  1
#define REMOTE_SOCKET 0

#define DEFAULT_COLLECTOR_ID     "UPX_001"
#define DEFAULT_COLLECTOR_HOST   "localhost"
#define DEFAULT_COLLECTOR_PORT   "6001"
#define DEFAULT_MQTT_PORT        "1883"

#define DEFAULT_HEARTBEAT         60
#define DEFAULT_PORT             "5000"
#define DEFAULT_LOG_PORT         "6001"
#define DEFAULT_WEB_SITE         "https://http-echo-server-123.herokuapp.com/"


//****************************************************************************************
//
//                                 COMMOM DATA AREA
//
//****************************************************************************************
static  char                        io_buffer[MAX_DATAGRAM_SIZE + HEADER_RESERVATION];

static struct {
    int   collect_mode;
    char *id_str;
    char *listen_port_str;
    char *mqtt_host_str;       char *mqtt_port_str;  char *mqtt_topic_str;
    char *remote_host_str;     char *remote_port_str;
    char *secondary_host_str;  char *secondary_port_str;
    char *collector_host_str;  char *collector_port_str;
    int   heartbeat;
    int   debug;
    char *collect_port_str;
    int   max_total_bytes;
    int   max_total_packets;
    char *rest_url_str;
} options = {
    0, 
    DEFAULT_COLLECTOR_ID,
    DEFAULT_PORT, 
    NULL,  DEFAULT_MQTT_PORT, NULL,
    NULL,  DEFAULT_PORT,
    NULL,  DEFAULT_PORT,
    NULL,  DEFAULT_COLLECTOR_PORT,
    DEFAULT_HEARTBEAT,
    0,
    DEFAULT_COLLECTOR_PORT,
    0,
    0,
    DEFAULT_WEB_SITE
};

static struct {
    int    initialized;
    int    heartbeat;
    long   total_packets;
    long   total_bytes;
    long   new_packets;
    long   new_bytes;
    struct timespec start0;
    struct timespec start;
    char  *last_src;
    char  *last_payload;
    char  *dst_host_port;
    char  *dst_host_1;
    int    dst_port_1;
    double new_rate;
    double prev_rate;
} monitor;


//****************************************************************************************
//
//       Utilities 
//
//****************************************************************************************

/************************
 * 
 *  Not thread safe
 *
 */
static char *now_as_string(char *fmt) {
    time_t rawtime;
    struct tm * timeinfo;
    time ( &rawtime );
    timeinfo = localtime ( &rawtime );
    static char buf[32];

    strftime(buf, 255, fmt, timeinfo );
    return buf;
}

//****************************************************************************************
//
// SFLOW 
//
//****************************************************************************************

//****************************************************************************************
//
// LIGHTWEIGHT HTTP LIBRARY: https://github.com/markusfisch/libhttp
//
//****************************************************************************************
struct http_message {
	struct {
		int code;
		int length;
	} header;
	char *content;
	int length;
	struct {
		int in_content;
		int chunk;
		char buf[4096];
		int size;
		char *offset;
		char *last;
		int free;
		int left;
		int total;
	} state;
};

/* low level methods */
struct http_url {
	char *protocol;
	char *host;
	char *query;
};

#ifndef HTTP_USER_AGENT
#define HTTP_USER_AGENT "Mozilla/4.0 (Linux)"
#endif

#ifndef HTTP_TIME_OUT
#define HTTP_TIME_OUT 360
#endif

/**
 * Parse URL into protocol, hostname and query part; the returned
 * structure needs to be freed after use
 *
 * @param url - URL
 */
struct http_url *http_parse_url(const char *url) {
	struct http_url *hu;
	size_t len;
	char *buf;
	char *p;

	if (!url ||
			(len = strlen(url)) < 1 ||
			!(hu = calloc(1, sizeof(struct http_url) + len + 1))) {
		return NULL;
	}

	buf = (char *) hu + sizeof(struct http_url);
	memcpy(buf, url, len);

	if ((p = strstr(buf, "://"))) {
		*p = 0;
		hu->protocol = buf;
		buf = p + 3;
	}

	hu->host = buf;

	if ((p = strchr(buf, '/'))) {
		*p = 0;
		hu->query = ++p;

		if ((p = strchr(p, '#'))) {
			*p = 0;
		}
	} else {
		hu->query = "";
	}

	if ((p = strchr(hu->host, ':'))) {
		hu->protocol = ++p;
	} else {
		hu->protocol = "http";
	}

	return hu;
}

/**
 * Resolve URL and try to connect
 *
 * @param hu - URL structure
 */
int http_connect(struct http_url *hu) {
	struct addrinfo hints, *si, *p;
	int sd = -1;

	memset(&hints, 0, sizeof(hints));
	hints.ai_family = AF_UNSPEC;
	hints.ai_socktype = SOCK_STREAM;

	/* cut off optional colon */
	{
		char buf[256];
		char *host = hu->host;
		char *p;

		if ((p = strchr(host, ':'))) {
			size_t l = p - host;

			if (l > sizeof(buf) - 1) {
				return -1;
			}

			*buf = 0;
			host = strncat(buf, host, l);
		}

		if (getaddrinfo(host, hu->protocol, &hints, &si)) {
			return -1;
		}
	}

	/* loop through all results until connect is successful */
	for (p = si; p; p = p->ai_next) {
		if ((sd = socket(
				p->ai_family,
				p->ai_socktype,
				p->ai_protocol)) < 0) {
			continue;
		}

		if (connect(sd, p->ai_addr, p->ai_addrlen) < 0) {
			close(sd);
			continue;
		}
		break;
	}
	if (!p && sd > -1) {
		close(sd);
		sd = -1;
	}
	freeaddrinfo(si);
	return sd;
}

/**
 * Send HTTP request
 *
 * @param sd - socket
 * @param rq - request
 */
int http_send(int sd, const char *rq) {
	size_t l;

	if (!rq) {
		return -1;
	}

	for (l = strlen(rq); l > 0;) {
		int bytes = send(sd, rq, l, 0);

		if (bytes < 0) {
			return -1;
		}

		rq += bytes;
		l -= bytes;
	}

	return 0;
}

/**
 * Cut off trailing CRLF
 *
 * @param msg - message struct
 */
static void http_cut_trailing_crlf(struct http_message *msg) {
	if (msg->state.chunk == 1 && msg->length > 0) {
		/* cut of just CR */
		msg->content[--msg->length] = 0;
	} else if (!msg->state.chunk && msg->length > 1) {
		/* cut of CR/LF */
		msg->length -= 2;
		msg->content[msg->length] = 0;
	}
}

/**
 * Parse message content
 *
 * @param msg - message struct
 * @param bod - begin of data, points to the first character
 * @param eod - end of data, points to the terminating NULL character
 */
static char *http_parse_content(
		struct http_message *msg,
		char *bod,
		char *eod) {
	int len = eod - bod;

	/* check if message is chunked */
	if (msg->state.chunk > -1) {
		/* check if chunk stops in this segment */
		if (msg->state.chunk < len) {
			char *eoc;

			if (msg->state.chunk > 0) {
				if (msg->state.chunk == 1) {
					/* skip trailing LF from previous
					 * chunk header */
					++bod;
					msg->length = 0;
					msg->state.chunk = 0;
				} else {
					/* return data before next chunk
					 * header first */
					msg->length = msg->state.chunk;
					msg->content = bod;

					bod += msg->state.chunk;

					msg->state.chunk = 0;
					http_cut_trailing_crlf(msg);
				}

				return bod;
			}

			/* chunk header is always at the begin of
			 * data here */
			if (!(eoc = strchr(bod, '\n'))) {
				/* chunk header is incomplete */
				return bod;
			}

			*eoc = 0;
			sscanf(bod, "%x", &msg->state.chunk);

			/* add trailing CR/LF to chunk size */
			msg->state.chunk += 2;

			msg->content = ++eoc;
			len = eod - msg->content;

			if (msg->state.chunk < len) {
				/* chunk ends in this segment and a new
				 * one starts */
				msg->length = msg->state.chunk;
				bod = msg->content + msg->state.chunk;

				/* CR/LF must be together here */
				msg->state.chunk = 0;
				http_cut_trailing_crlf(msg);

				return bod;
			} else {
				/* next chunk header is beyond this segment */
				msg->length = len;

				msg->state.chunk -= len;
				http_cut_trailing_crlf(msg);

				return eod;
			}
		} else {
			/* next chunk header is beyond this segment;
			 * fall through to default behaviour */
			msg->state.chunk -= len;
		}
	}

	msg->content = bod;
	msg->length = len;

	http_cut_trailing_crlf(msg);

	return eod;
}

/**
 * Parse HTTP message
 *
 * @param msg - message struct
 * @param bod - begin of data, points to the first character
 * @param eod - end of data, points to the terminating NULL character
 */
static char *http_parse_message(
		struct http_message *msg,
		char *bod,
		char *eod) {
	char *lf;

	if (!bod) {
		return bod;
	}

	if (msg->state.in_content) {
		return http_parse_content(msg, bod, eod);
	}

	/* header line is incomplete so fetch more data */
	if (!(lf = strchr(bod, '\n'))) {
		return bod;
	}

	/* parse_options status code */
	if (!msg->header.code) {
		/* accept HTTP/1.[01] only */
		if (strncmp(bod, "HTTP/1.", 7) ||
				!strchr("01", *(bod + 7))) {
			return NULL;
		}

		bod += 8;
		msg->header.code = atoi(bod);

		return http_parse_message(msg, ++lf, eod);
	}

	/* parse_options header line by line */
	for (; lf; bod = ++lf, lf = strchr(bod, '\n')) {
#define WHITESPACE " \t\r\n"
		char *value;

		*lf = 0;

		/* check for end of header */
		if (!*bod || !strcmp(bod, "\r")) {
			if (!*bod) {
				++bod;
			} else {
				bod += 2;
			}

			msg->state.in_content = 1;

			return http_parse_message(msg, bod, eod);
		}

		if (!(value = strchr(bod, ':'))) {
			continue;
		}

		*value = 0;
		++value;

		bod += strspn(bod, WHITESPACE);
		strtok(bod, WHITESPACE);

		value += strspn(value, WHITESPACE);
		strtok(value, WHITESPACE);

		if (!strcasecmp(bod, "Transfer-Encoding") &&
				!strcasecmp(value, "chunked")) {
			/* means 0 bytes until next chunk header */
			msg->state.chunk = 0;
		} else if (!strcasecmp(bod, "Content-Length")) {
			msg->header.length = atoi(value);
		}
	}

	return bod;
}

/**
 * Read next part of the response; returns 0 when message is complete;
 * this function blocks until data is available
 *
 * @param sd - socket
 * @param msg - message struct that gets filled with data, must be
 *              all 0 for the very first call
 */
int http_read(int sd, struct http_message *msg) {
	if (!msg) {
		return -1;
	}

	/* first-time initialization */
	if (!msg->state.offset) {
		/* initialize size of read buffer;
		 * reserve a byte for the terminating NULL
		 * character */
		msg->state.size = sizeof(msg->state.buf) - 1;
		msg->state.offset = msg->state.buf;

		/* initialize remaining length of chunk;
		 * -1 means content is not chunked */
		msg->state.chunk = -1;

		/* initialize content length;
		 * -1 means not given */
		msg->header.length = -1;
	}

	if (msg->state.total == msg->header.length)
		/* return 0 for keep-alive connections */
	{
		return 0;
	}

	for (;;) {
		/* try to parse_options buffer first if there's still data in it */
		if (msg->state.left > 0) {
			char *parsed_until;

			msg->length = 0;

			parsed_until = http_parse_message(
				msg,
				msg->state.offset,
				msg->state.offset + msg->state.left);

			if (parsed_until > msg->state.offset) {
				msg->state.left -= parsed_until - msg->state.offset;
				msg->state.offset = parsed_until;
				msg->state.total += msg->length;
				return 1;
			}
		}

		/* make offset begin at the front of the buffer */
		if (msg->state.offset > msg->state.buf) {
			if (msg->state.left > 0)
				memmove(
					msg->state.buf,
					msg->state.offset,
					msg->state.left);

			msg->state.offset = msg->state.buf;
		}

		/* wait for and read new data from the network */
		{
			char *append = msg->state.offset + msg->state.left;
			int bytes,
				size = (msg->state.buf + msg->state.size)-append;

			/* drop half of the buffer if there's no space left */
			if (size < 1) {
				int half = msg->state.size >> 1;

				memcpy(
					msg->state.buf,
					msg->state.buf + half,
					half);

				msg->state.offset = msg->state.buf;
				msg->state.left = half;

				append = msg->state.offset + msg->state.left;
				size = msg->state.size - msg->state.left;
			}

			if ((bytes = recv(
					sd,
					append,
					size,
					0)) < 1) {
				/* bytes == 0 means remote socket was closed */
				return 0;
			}

			append[bytes] = 0;
			msg->state.left += bytes;
		}
	}

	return 0;
}

/**
 * Send HTTP request
 *
 * @param url - URL
 */
int http_request(const char *url) {
	struct http_url *hu;
	int sd;

	if (!(hu = http_parse_url(url)) ||
			(sd = http_connect(hu)) < 0) {
		/* it's save to free NULL */
		free(hu);
		return -1;
	}

	/* this way even very very long query strings won't be a problem */
	if (http_send(sd, "GET /") ||
			http_send(sd, hu->query) ||
			http_send(sd, " HTTP/1.1\r\n\
User-Agent: "HTTP_USER_AGENT"\r\n\
Host: ") ||
			http_send(sd, hu->host) ||
			http_send(sd, "\r\n\
Accept: */*\r\n\
Connection: close\r\n\
\r\n")) {
#ifdef WIN32
		closesocket(sd);
#else
		close(sd);
#endif
		return -1;
	}

	free(hu);

	return sd;
}

/**
 * Read next part of the response; returns 0 when message is complete;
 * this function blocks until data is available
 *
 * @param sd - socket
 * @param msg - message struct that gets filled with data, must be
 *              all 0 for the very first call
 */
int http_response(int sd, struct http_message *msg) {
	fd_set r;
	struct timeval tv;

	tv.tv_sec = HTTP_TIME_OUT;
	tv.tv_usec = 0;

	FD_ZERO(&r);
	FD_SET(sd, &r);

	if (select(sd + 1, &r, NULL, NULL, &tv) < 1 ||
			!FD_ISSET(sd, &r)) {
		return -1;
	}

	return http_read(sd, msg);
}


//****************************************************************************************
//
//                                     PARSE OPTIONS 
//
//****************************************************************************************

/************************
 * 
 *  Replaces the last ':' by '\0'
 *
 */
static char * split_host_port(char *s) {
    char *port = NULL;
    for (; *s; s++) {
        if (*s == ':') {
            port = s;
        }
    }
    if (port) {
        *port = '\0';
        port ++;
    }
    return port;
}


/************************
 * 
 * 
 *
 */
static void help(char *program) {
    fprintf(stderr,"------------------------------------\n");
    fprintf(stderr,"UDPFLEX for V-PRISM      version 0.9\n");
    fprintf(stderr,"------------------------------------\n");
    fprintf(stderr,"Usage: %s [ options ] [remote_host [ remote_port ]]  \n",program);
    fprintf(stderr,"remote_host                - destination host\n");
    fprintf(stderr,"remote_port                - destination udp port - Default = 5000\n");
    fprintf(stderr,"Forward mode options:\n");
    fprintf(stderr,"  -p udp_port              - local udp port. Default = 5000\n");
    fprintf(stderr,"  -id ID_String             - used to identify this instance. Default = UPX_001\n");
    fprintf(stderr,"  -ts time silence          - maximum time silence seconds (heartbeat). Default = 60\n");
    fprintf(stderr,"  ====== Secondary destination\n");
    fprintf(stderr,"  -s secondary_host        - ip of secondary remote host. \n");
    fprintf(stderr,"  -sp secondary_port       - udp port of secondary remote host  - Default = 5000\n");
    fprintf(stderr,"  ====== Mqtt server\n");
    fprintf(stderr,"  -mh mqtt_host            - mqtt host\n");
    fprintf(stderr,"  -mp mqtt_port            - mqtt port  - Default = 1883\n");
    fprintf(stderr,"  -mt mqtt_topic           - mqtt topic \n");
    fprintf(stderr,"  ====== Collector instance\n");
    fprintf(stderr,"  -c  collector_host       - ip of remote collector. \n");
    fprintf(stderr,"  -cp collector_port       - udp port of remote collector. Default = 6001 \n");
    fprintf(stderr,"Collect mode options:\n");
    fprintf(stderr,"  -R REST_URL             - url of REST database collector.\n");
    fprintf(stderr,"  -P collect_port         - listen port in collect mode. Default=6001\n");
    fprintf(stderr,"Common options:\n");
    fprintf(stderr,"  -h                      - prints this help\n");
    fprintf(stderr,"  -D                      - debug. print on stderr \n");
}

/************************
 * 
 * 
 *
 */
static int parse_int_option(char *s, int *res, char *err) {
    *res = atoi(s);
    if (!*res) {

    }
}

/************************
 * 
 * 
 *
 */
static void parse_command_line(int argc, char *argv[]) {
#if 0
    if (argc < 2) {
        help(argv[0]);
        exit(EXIT_FAILURE);
    } 

    // defaults
    #define SET_IF_NULL(A,B) if (!(A)) A = (B);
    SET_IF_NULL(options.listen_port_str,"5000");
    SET_IF_NULL(options.remote_port_str,"5000");
    #undef SET_IF_NULL
#endif

#define CHECK_MODE(M) if (options.collect_mode == M) {                   \
                    fprintf(stderr, "Mixing forward mode and collect mode!"); \
            }

    int i;
    char **it;
    options.collect_mode = -1;

    // parse_options options
    for (i=1, it=argv+1; i < argc; i++, it++) {
        if (*it[0] != '-') break;

        if (strcmp(*it,"-p") == 0) {
            CHECK_MODE(1);
            i ++;
            it ++;
            options.listen_port_str = *it;
            options.collect_mode = 0;
        } 
        else
        if (strcmp(*it,"-h") == 0) {
            help(argv[0]);
            exit(EXIT_FAILURE);
        }
        else
        if (strcmp(*it,"-id") == 0) {
            CHECK_MODE(1);
            i ++;
            it ++;
            options.id_str = *it;
            options.collect_mode = 0;
        }
        else
        if (strcmp(*it,"-P") == 0) {
            CHECK_MODE(0);
            i ++;
            it ++;
            options.collect_port_str = *it;
            options.collect_mode = 1;
        }
        else
        if (strcmp(*it,"-R") == 0) {
            CHECK_MODE(0);
            i ++;
            it ++;
            options.rest_url_str = *it;
            options.collect_mode = 1;
        }
        else
        if (strcmp(*it,"-mh") == 0) {
            CHECK_MODE(1);
            i ++;
            it ++;
            options.mqtt_host_str = *it;
            options.collect_mode = 0;
        }
        else
        if (strcmp(*it,"-mp") == 0) {
            CHECK_MODE(1);
            i ++;
            it ++;
            options.mqtt_port_str = *it;
            options.collect_mode = 0;
        }
        else
        if (strcmp(*it,"-mt") == 0) {
            CHECK_MODE(1);
            i ++;
            it ++;
            options.mqtt_topic_str = *it;
            options.collect_mode = 0;
        }
        else
        if (strcmp(*it,"-c") == 0 || strcmp(*it,"-ch") == 0) {
            CHECK_MODE(1);
            i ++;
            it ++;
            options.collector_host_str = *it;
            options.collect_mode = 0;
        }
        else
        if (strcmp(*it,"-cp") == 0) {
            CHECK_MODE(1);
            i ++;
            it ++;
            options.collector_port_str = *it;
            options.collect_mode = 0;
        }
        else
        if (strcmp(*it,"-s") == 0 || strcmp(*it,"-sh") == 0) {
            CHECK_MODE(1);
            i ++;
            it ++;
            options.secondary_host_str = *it;
            options.collect_mode = 0;
        }
        else
        if (strcmp(*it,"-sp") == 0) {
            CHECK_MODE(1);
            i ++;
            it ++;
            options.secondary_port_str = *it;
            options.collect_mode = 0;
        }
        else
        if (strcmp(*it,"-D") == 0) {
            options.debug = 1;
        }
        else
        if (strcmp(*it,"-hs") == 0 || strcmp(*it,"-ts") == 0) {
            CHECK_MODE(1);
            i ++;
            it ++;
            int hb = atoi(*it);
            int err = 0;
            if (!hb) {
                err = (strcmp(*it,"0") != 0);
            } else {
                err = (hb < 1) || (hb > 3600);
            }
            if (!err) {
                options.heartbeat = hb;
            } else {
                perror("INVALID HEARTBEAT SECONDS");
                exit(EXIT_FAILURE);
            }
            options.collect_mode = 0;
        }
    }

    if (options.collect_mode==-1) {
        options.collect_mode = 0;
    } 

    if (options.collect_mode==1) {
        if (i < argc) {
            fprintf(stderr,"Warninig: Mode is undefined.\n");
        }
        return;
    } 
    
    if (i < argc) {
        options.remote_host_str = *it;
        i++; it++;
    }

    if (i < argc) {
        options.remote_port_str = *it;
        i++; it++;
    }

    if (i == argc) {
        if (!options.remote_host_str) {
            if (!options.mqtt_host_str || !options.mqtt_topic_str) {
                fprintf(stderr,"Missing destination_host and mqtt_host or mqtt_topic!\n\n");
                fprintf(stderr,"For help on command line options, run again using option -h\n");
                exit(EXIT_FAILURE);
            }
        }
    }
}


//****************************************************************************************
//
//                                  INIT NETWORK SOCKETS  
//
//****************************************************************************************

/************************
 * 
 * 
 *
 */
static int init_socket(int local_remote, char *host, char *port, int tcp) {
    struct addrinfo hints;
    struct addrinfo *result, *rp;
    int sfd, s;
    struct sockaddr_storage peer_addr;
    socklen_t peer_addr_len;
    ssize_t nread;

    // remote hosts need address
    if (local_remote == REMOTE_SOCKET && !host) return 0;

    // handles missing monitor info
    memset(&hints, 0, sizeof(struct addrinfo));

    hints.ai_family = AF_INET;      /* Allow IPv4 or IPv6 */
    if (tcp) {
        hints.ai_socktype = SOCK_STREAM; /*  socket */  
    } else {
        hints.ai_socktype = SOCK_DGRAM; /* Datagram socket */
    }
    hints.ai_flags = AI_PASSIVE;    /* For wildcard IP address */
    hints.ai_protocol = 0;          /* Any protocol */
    hints.ai_canonname = NULL;
    hints.ai_addr = NULL;
    hints.ai_next = NULL;

   s = getaddrinfo(host, port,  &hints, &result);
    if (s != 0) {
        fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(s));
        exit(EXIT_FAILURE);
    }

   /* getaddrinfo() returns a list of address structures.
       Try each address until we successfully bind(2).
       If socket(2) (or bind(2)) fails, we (close the socket
       and) try the next address. */

    for (rp = result; rp != NULL; rp = rp->ai_next) {
        sfd = socket(rp->ai_family, rp->ai_socktype, rp->ai_protocol);
        if (sfd == -1) continue;
        if (local_remote == LOCAL_SOCKET) {
            if (bind(sfd, rp->ai_addr, rp->ai_addrlen) == 0) {
                freeaddrinfo(result);           /* No longer needed */
                return sfd;
            }
        } else {
            if (connect(sfd, rp->ai_addr, rp->ai_addrlen) == 0) {
                return sfd;
            }
        }
        close(sfd);
    }

    fprintf(stderr, "Could not bind\n");
    exit(EXIT_FAILURE);
}


//****************************************************************************************
//
//                                     monitor   
//
//****************************************************************************************

#define MAX_DATETIME_STR 32
static char agent_buffer[MAX_DATAGRAM_SIZE + MAX_DATETIME_STR];
static char url[2048];


/************************
 * 
 *  https://http-echo-server-123.herokuapp.com/teste
 *
 */
static int send_via_rest(char *url) {
	struct http_message msg;

    int sd = http_request(url);
	if ( sd < 1) {
		perror("http_request");
		return -1;
	}

	memset(&msg, 0, sizeof(msg));
	while (http_response(sd, &msg) > 0) {
		if (msg.content) {
			// write(1, msg.content, msg.length);
		}
	}
	close(sd);

	if (msg.header.code != 200) {
		fprintf(
			stderr,
			"error: returned HTTP code %d\n",
			msg.header.code);
	}
	return 0;
}

/************************
 * 
 * 
 *
 */
static int send_via_get(char *data) {
	struct http_message msg;

    strcpy(url,options.rest_url_str);
    strcat(url,data);

    send_via_rest(url);
}


/************************
 * 
 * 
 *
 */
static void agent_init(int heartbeat) {
    memset(&monitor,0,sizeof(monitor));
    monitor.initialized = 1;
    monitor.heartbeat = heartbeat * 1000;
    
    if (clock_gettime(CLOCK_MONOTONIC, &monitor.start0) == -1) {
        perror("clock_gettime");
        exit(EXIT_FAILURE);
    }
    memcpy(&monitor.start, &monitor.start0, sizeof(monitor.start0));
}

/************************
 * 
 * 
 *
 */
static int agent_compute_delta(int reset) {
    struct timespec stop;
    if (clock_gettime(CLOCK_MONOTONIC, &stop) == -1) {
        perror("clock_gettime");
        exit(EXIT_FAILURE);
    }

    int res = (stop.tv_sec - monitor.start.tv_sec) * 1000 + 
                  (stop.tv_nsec - monitor.start.tv_nsec) / 1000000;

    if (reset) {
        memcpy(&monitor.start, &stop, sizeof(monitor.start));
    }

    return res;
}

/************************
 * 
 * 
 *
 */
static void agent_send(
        int socket, int milliseconds,
        char *src, char *payload) {

    if (!src) src="";

    // ------ begin testing -------------
    // converts the from address to string
    struct sockaddr *flex = (struct sockaddr *) src;

    char source[256] = "";

    // IPV4 address to String
    if (flex->sa_family == AF_INET) {
        struct sockaddr_in *ip4 = (struct sockaddr_in *) src;
        char *bytes = (char *) (& ip4->sin_addr.s_addr);
        // assumes little endian architeture
        sprintf(source,"%d.%d.%d.%d:%d", 
            bytes[0],bytes[1],bytes[2],bytes[3], 
            ip4->sin_port);
    }

    char *now  = now_as_string("%Y%m%d_%H%M%S");

    char *host1 = (monitor.dst_host_1)?monitor.dst_host_1:"_";

    // list 
    int len = sprintf(agent_buffer,":%s;%s;%s:%d;%d;%ld;%ld;%s;%ld;%ld", 
        options.id_str,  
        (!*source?"_/_":source), host1, monitor.dst_port_1, 
        milliseconds, monitor.new_bytes, monitor.new_packets,
        now, monitor.total_bytes, monitor.total_packets);


    if (options.debug) {
        fprintf(stderr,"id:%s; %s->%s:%d; bytes: %8ld; packets:%8ld\n", 
            options.id_str, 
            source, host1, monitor.dst_port_1, 
            monitor.total_bytes, monitor.total_packets);
        fprintf(stderr,"Sent [x]: [%s]\n", agent_buffer);
    }

    send(socket, agent_buffer, len+1, 0);
    // send_via_get(agent_buffer);

    monitor.total_bytes += monitor.new_bytes;
    monitor.total_packets += monitor.new_packets;

    monitor.new_bytes = 0;
    monitor.new_packets = 0;
    monitor.prev_rate = monitor.new_rate;
    agent_compute_delta(1);

}

/************************
 * 
 * 
 *
 */
static int agent_check_rate_variation(int milliseconds) {
    if (!milliseconds) return 0;
    
    monitor.new_rate = (double) monitor.new_bytes / milliseconds;
    // fprintf(stderr,"%ld, %d, %f, %f\n",monitor.new_bytes, milliseconds, monitor.prev_rate, monitor.new_rate);

    #define MAX_RATE_VARIATION 10
    #define a monitor.new_rate
    #define b monitor.prev_rate
    return (a>b && (!b || a/b > MAX_RATE_VARIATION)) 
                || (b>a && (!a || b/a > MAX_RATE_VARIATION));
    #undef a 
    #undef b
}

/************************
 * 
 * 
 *
 */
static void agent_heartbeat(int socket) {

    if (!monitor.heartbeat) return;

    if (!monitor.initialized) {
        perror("monitor not initialized");
        exit(EXIT_FAILURE);
    }
    
    int milliseconds = agent_compute_delta(0);

    int must_send = (milliseconds >= monitor.heartbeat) 
                    || agent_check_rate_variation(milliseconds)
                    || monitor.new_rate > 0;

    if (must_send) {
        agent_send(socket, milliseconds, monitor.last_src, monitor.last_payload);
    }
}


/************************
 * 
 * 
 *
 */
static void agent_update(
        int socket, 
        char *src, char *payload, int payload_len) { 

    int milliseconds = agent_compute_delta(0);

    monitor.new_bytes += payload_len;
    monitor.new_packets ++;

/*
    if (milliseconds == 0) {
        monitor.new_rate = monitor.prev_rate;
    } else {
        monitor.new_rate = (double) monitor.new_bytes / milliseconds;
    }
*/
    // fprintf(stderr,"%ld, %d, %f, %f\n",monitor.new_bytes, milliseconds, monitor.prev_rate, monitor.new_rate);

    int must_send = 0;

    if (milliseconds >= monitor.heartbeat) {
        must_send = 1;

    } else if (options.max_total_bytes && (monitor.new_bytes >= options.max_total_bytes)) {
        must_send = 1;

    } else if (options.max_total_packets && (monitor.total_packets >= options.max_total_packets)) {
        must_send = 1;

    } else {
        must_send = agent_check_rate_variation(milliseconds);
    }

    monitor.last_src = src;
    monitor.last_payload = payload;

    if  (must_send) {
        agent_send(socket, milliseconds, src, payload);
    }
}

//****************************************************************************************
//
//                                     COLLECT MODE   
//
//****************************************************************************************


/************************
 * 
 * 
 *
 */
static void collect_loop(char *port) {

    int socket_in   = init_socket(LOCAL_SOCKET, NULL, port, 0);

    //
    // INFORM OPERATION MODE
    //
    fprintf(stderr,"--------------------------------------------------------------------------\n");
    fprintf(stderr,"Collect mode. Listening on port: %s\n", port);
    fprintf(stderr,"--------------------------------------------------------------------------\n");
    
    //char fname[256];
    //sprintf(fname, "log_%s.txt", now_as_string("%Y%m%d_%H") );

    //FILE *f = fopen(fname, "at");

    // ready to handle for non ipv4 addresses
    unsigned char flex_src_addr[256];
    
    // payload area begins after a header reservation
    // useful to "forge" a fake packet around the payload 
    // to send as "sample packet"
    char *payload = io_buffer + HEADER_RESERVATION;

    // loop forever
    while (1) {
        //
        // Receive
        //
        socklen_t src_in_len = sizeof(flex_src_addr);
        int payload_len = recvfrom(socket_in, payload, MAX_DATAGRAM_SIZE, 
                MSG_WAITALL, (struct sockaddr*) &flex_src_addr, &src_in_len);
        int err = errno;

        if (payload_len < 0) {
            fprintf(stderr, "Erro %d\n", err);
            exit(EXIT_FAILURE);
        } 

        if (payload[0] == ':') {
            // compute now
            char *now  = now_as_string("%Y%m%d_%H%M%S");
            if (options.debug) fprintf(stderr,"%s:%s\n", now, payload+1);
            //fprintf(f,"%s: %s\n", s, payload+1);
            //fflush(f);

            char *url, *s; 
            s = options.rest_url_str;
            int len = 0;
            for (url = agent_buffer; *s; s++, url++ ) {
                *url = *s;
                len ++;
            }

            // append '/'
            if (len && url[-1]  != '/') { 
                *url  = '/'; 
                url ++;
            }

            // append payload
            for (s = payload+1; *s; s++, url++) {
                if (*s == ';' || *s == ':') *s = '/';
                *url = *s;
            }

            // end of strig
            *url = '\0';

            send_via_rest(agent_buffer);

            if (options.debug) {
                fprintf(stderr,"Received [x]: [%s]\n", payload);
            }
        }      
    }
}


//****************************************************************************************
//
//                                     OUT_SOCKET LIST   
//
//****************************************************************************************

typedef struct s_oitem {
    int    socket;
    int    add_remove; // add = 1, remove = -1
    char   name[1024];
    struct s_oitem *next, *prev;
} Oitem, *POitem;

typedef struct s_olist {
    int    n;
    POitem first;
    POitem last;
} Olist, *POlist;

/************************
 * 
 * 
 *
 */
POlist olist_create(void) {
    return calloc(1, sizeof(Olist));
}

/************************
 * 
 * 
 *
 */
void olist_destroy(POlist pol) {
    POitem poi, pnext;
    for (poi = pol->first; poi; poi=pnext) {
        pnext = poi->next;
        free(poi);
    }
    free(pol);
}

/************************
 * 
 * 
 *
 */
POitem olist_append(POlist pol, int socket, char *host, char *port) {
    POitem poi = calloc(sizeof(Oitem), 1);

    poi->socket = socket;
    poi->add_remove = 1;
    strcpy(poi->name,host);
    strcat(poi->name,":");
    strcat(poi->name,port);
    poi->prev = pol->last;

    if (pol->last) {
        pol->last->next = poi;
    } else {
        pol->first = poi;
    }
    pol->last = poi;
    pol->n ++;

    return poi;
}

/************************
 * 
 * 
 *
 */
POitem olist_locate_by_host_port(POlist pol, char *host, char *port) {
    char name[100];
    POitem poi;
    strcpy(name,host);
    strcat(name,":");
    strcat(name,port);

    for (poi = pol->first; poi; poi= poi->next) {
        if (strcmp(name, poi->name)==0) return poi;
    }
    return NULL;
}

/************************
 * 
 * 
 *
 */
static POitem olist_delete(POlist pol, POitem poi) {
    if (poi->prev) {
        poi->prev->next = poi->next;
    } else {
        pol->first = poi->next;
    }
    if (poi->next) {
        poi->next->prev = poi->prev;
    } else {
        pol->last = poi->prev;
    }
    pol->n --;
    free(poi);
    return NULL;
}

/************************
 * 
 * 
 *
 */
static POitem olist_pop(POlist list) {
    if (!list->first) return NULL;
    POitem p = list->first;
    list->first = p->next;
    if (list->first) list->last = NULL;
    return p;
}


static POlist out_list = NULL;

//****************************************************************************************
//
//                                     FORWARD   
//
//****************************************************************************************


/************************
 * 
 * 
 *
 */
static void set_socket_timeout(int socket, int seconds) {
    // about time 
    struct timeval tv;
    tv.tv_sec = 1;
    tv.tv_usec = 0;
    if (setsockopt(socket, SOL_SOCKET, SO_RCVTIMEO, &tv,sizeof(tv)) < 0) {
        perror("Error");
    }
}

#define RCVBUF_SZ   (256*1024)
static char rcvbuf[RCVBUF_SZ];

#define MAX_SOCKETS 1024
static int  n_out_sockets = 0;
static int  out_sockets[MAX_SOCKETS];
static int out_changes = 0;

static pthread_mutex_t lock; 


/************************
 * 
 * 
 *
 */
static int update_sockets(void) {
    int updated = 0;
    pthread_mutex_lock(&lock);

    if (out_changes) {
        POitem poi, pnext;
        int *ps;
        //printf("Changes %d\n", n_out_sockets);
        n_out_sockets = 0;

        for (poi = out_list->first, ps=out_sockets; poi; poi = pnext) {
            pnext = poi->next;

            int socket = poi->socket;
            if (poi->add_remove >= 0) {
                *ps = socket;
                ps ++;
                n_out_sockets ++;
                //printf("Add socket %s %d\n",poi->name,socket);
                poi->add_remove = 0;

            } else if (poi->add_remove < 0) {
                //printf("Remove socket %s %d\n",poi->name,socket);
                close(socket);
                olist_delete(out_list, poi);
            }
        }
        out_changes  = 0;
        updated = 1;
    }

    pthread_mutex_unlock(&lock);
    return updated;
}

/************************
 * 
 * 
 *
 */
int forward_loop(int socket_in, int collector_out) {
    struct sockaddr_in src_in;

    // payload area begins after a header reservation
    // useful to "forge" a fake packet around the payload 
    // to send as "sample packet"
    char *payload = io_buffer + HEADER_RESERVATION;

    // ready to handle for non ipv4 addresses
    char flex_src_addr[256];

    int exit_mode = EXIT_SUCCESS;

    if (collector_out) {
        agent_send(collector_out, 0, monitor.last_src, NULL);
    }

    // loop forever
    while (1) {

        //
        // Receive
        //
        socklen_t src_in_len = sizeof(flex_src_addr);
        int payload_len = recvfrom(socket_in, payload, MAX_DATAGRAM_SIZE, 
                MSG_WAITALL, (struct sockaddr*) &flex_src_addr, &src_in_len);
        int err = errno;

        // 
        // Update sockets after burst
        //
        // printf("n %d\n",n_out_sockets);
        update_sockets();

        //
        // Any annomaly?
        //
        if (payload_len <= 0) {
            if (err == EAGAIN) {
                // update sockets when idle
                update_sockets();

                if (collector_out) {
                    agent_heartbeat(collector_out); // send a heartbeat
                }
                continue;
            } 
            if (payload_len == 0) {
                // graceful shutdown
                break;
            }
            fprintf(stderr, "Erro %d\n", err);
            exit_mode = EXIT_FAILURE;
            break;
        }
 

        //
        // Send to collector, if exists
        //
        if (collector_out) {
            agent_update(collector_out, flex_src_addr, payload, payload_len);
        }
    
        //
        // Forward packet
        //
        int i;
        for (i=0; i < n_out_sockets; i++) {
            send(out_sockets[i], payload, payload_len, 0);
        }

    }

    return exit_mode;
}


/************************
 * 
 * 
 *
 */
int append_host_port(POlist pol, char *dst_host, char *dst_port) { 
    int socket = init_socket(REMOTE_SOCKET, dst_host, dst_port, 0);
    if (!socket) return 0;
    //printf("Create socket %d\n",socket);
       
    pthread_mutex_lock(&lock);
    olist_append(pol, socket, dst_host, dst_port);
    out_changes ++;
    pthread_mutex_unlock(&lock);

    return socket;
}

/************************
 * 
 * 
 *
 */
POitem remove_host_port(POlist pol,  char *dst_host, char *dst_port) { 
    
    pthread_mutex_lock(&lock);
    POitem poi = olist_locate_by_host_port(pol, dst_host, dst_port);
    if (poi) {
        poi->add_remove = -1;
        out_changes ++;
    }
    pthread_mutex_unlock(&lock);

    return poi;
}


//****************************************************************************************
//
//                                     MQTT
//
//****************************************************************************************

/************************
 * 
 * 
 *
 */
static void mqtt_callback(void** unused, struct mqtt_response_publish *published) {

    //fprintf(stderr, "CALLBACK: 1\n"); fflush(stderr);
//    exit(0);

    /* note that published->topic_name is NOT null-terminated (here we'll change it to a c-string) */
    char* topic_name = (char*) malloc(published->topic_name_size + 1);

    memcpy(topic_name, published->topic_name, published->topic_name_size);
    topic_name[published->topic_name_size] = '\0';

    if (strcmp(topic_name,options.mqtt_topic_str)==0) {
        char *m = (char*) published->application_message;
        m[published->application_message_size] = '\0';
        char *p;
        char *args[10];
        int n;

        n = 0; args[n] = m;
        for (p=m; *p; p++) {
            if (*p == ';') {
                *p = '\0'; n++;
                if (n==10) break;
                args[n] = p+1;
            }
        }
        n++;

        if (n!=4) {
            printf("SUB: Invalid line.\n");
        } else if (strcmp(args[2],options.id_str)!=0) {
            printf("SUB: invalid id. Expected '%s' got '%s'\n", args[2], options.id_str);
        } else if (strcmp(args[3],"A")== 0) {
            //printf("SUB: Add.\n");
            append_host_port(out_list, args[0], args[1]); 
            
        } else if (strcmp(args[3],"R")== 0) {
            //printf("SUB: Remove.\n");
            remove_host_port(out_list, args[0], args[1]); 
        } else {
            printf("SUB: invalid Command: ");
            int i;
            for (i=0; i<n; i++) {
                printf("[%d]=%s, ",i,args[i]);
            }
            printf("\n");
        }
    }


    free(topic_name);
}

/************************
 * 
 * 
 *
 */
void* mqtt_client(void* client) {
    while(1) {
        mqtt_sync((struct mqtt_client*) client);
        usleep(100000U);
    }
    return NULL;
}

static pthread_t mqtt_daemon;
static int mqtt_socket;

#include <fcntl.h>

/************************
 * 
 * 
 *
 */
static int mqtt_begin(char *addr,char *port,const char *topic) {

//        port = "1883";
//        topic = "datetime";

    /* open the non-blocking TCP socket (connecting to the broker) */
    mqtt_socket= init_socket(REMOTE_SOCKET, addr, port, 1);
    fcntl(mqtt_socket, F_SETFL, fcntl(mqtt_socket, F_GETFL, 0) | O_NONBLOCK);

    if (mqtt_socket == -1) {
        perror("Failed to open socket: ");
        return 0;
    }

    /* setup a client */
    static struct mqtt_client client;
    static uint8_t sendbuf[2048]; /* sendbuf should be large enough to hold multiple whole mqtt messages */
    static uint8_t recvbuf[1024]; /* recvbuf should be large enough any whole mqtt message expected to be received */

    mqtt_init(&client, mqtt_socket, sendbuf, sizeof(sendbuf), recvbuf, sizeof(recvbuf), mqtt_callback);

    /* Create an anonymous session */
    const char* client_id = NULL;

    /* Ensure we have a clean session */
    uint8_t connect_flags = MQTT_CONNECT_CLEAN_SESSION;

    /* Send connection request to the broker. */
    mqtt_connect(&client, client_id, NULL, NULL, 0, NULL, NULL, connect_flags, 400);

    /* check that we don't have any errors */
    if (client.error != MQTT_OK) {
        fprintf(stderr, "error: %s\n", mqtt_error_str(client.error));
        return 0;
    }

    /* start a thread to refresh the client (handle egress and ingree client traffic) */
    if(pthread_create(&mqtt_daemon, NULL, mqtt_client, &client)) {
        fprintf(stderr, "Failed to start client daemon.\n");
        return 0;
    }

    /* subscribe */
    if (mqtt_subscribe(&client, topic, 0) != MQTT_OK) {
        fprintf(stderr, "MQTT SUBSCRIBE ERROR.\n");
        return 0;
    }

#if 0    
    /* start publishing the time */
    printf("listening for '%s' messages.\n", topic);
    printf("Press CTRL-D to exit.\n\n");
    
    /* block */
    // while(fgetc(stdin) != EOF); 
    
    /* disconnect */
    printf("\n%s disconnecting from %s\n", argv[0], addr);
    sleep(1);
    /* exit */ 
    // exit_example(EXIT_SUCCESS, sockfd, &client_daemon);
#endif
    return 1;
}

/************************
 * 
 * 
 *
 */
static int mqtt_end(void) {
    if (mqtt_socket != -1) close(mqtt_socket);
    pthread_cancel(mqtt_daemon);
}

//****************************************************************************************
//
//                                     MAIN   
//
//****************************************************************************************



/************************
 * 
 * 
 *
 */
int main(int argc, char *argv[]) {
    struct sockaddr_in src_in;

    //
    // PARSE OPTIONS
    //
   
    // settings just for tests
    // options.listen_port_str = "2001";  options.remote_port_str = "2002";

    parse_command_line(argc, argv);

    //----------------------------
    // collector mode?
    //----------------------------
    if (options.collect_mode) {
        collect_loop(options.collect_port_str);
        return 0;
    } 

    //----------------------------
    // Forward Mode
    //----------------------------

    //
    // Initialization of Core System Variables
    //
    pthread_mutex_init(&lock, NULL);

    out_list = olist_create();

    //
    // hosts and ports
    //
    char *c_host = options.collector_host_str;
    char *c_port = options.collector_port_str;

    char *dst_host = options.remote_host_str;
    char *dst_port = options.remote_port_str;

    char *sec_host = options.secondary_host_str;
    char *sec_port = options.secondary_port_str;

    //
    // SOCKETS IN & COLLECTOR
    //
    int socket_in   = init_socket(LOCAL_SOCKET, NULL, options.listen_port_str, 0);
    int collector_out = init_socket(REMOTE_SOCKET, c_host, c_port, 0);
    set_socket_timeout(socket_in, 1);
    setsockopt(socket_in, SOL_SOCKET, SO_RCVBUF, rcvbuf, sizeof(rcvbuf));


    //
    // MQTT
    //
    if (options.mqtt_topic_str && options.mqtt_host_str) {
        if (!mqtt_begin(options.mqtt_host_str, options.mqtt_port_str, options.mqtt_topic_str)) {
            fprintf(stderr,"MQTT Failure\n");
            return(10);
        }
    }

    //
    // INITIAL OUT SOCKETs
    //
    int proxy_out   = append_host_port(out_list, dst_host, dst_port);
    int proxy_out_2 = append_host_port(out_list, sec_host, sec_port);


#if 0
    int proxy_out   = init_socket(REMOTE_SOCKET, dst_host, dst_port, 0);
    int proxy_out_2 = init_socket(REMOTE_SOCKET, sec_host, sec_port. 0);

    //
    // insert OUT SOCKETS in OUT_LIST
    //
    if (proxy_out) {
        olist_append(out_list, proxy_out, "udp0");
        out_changes ++;
    }
    if (proxy_out_2) {
        olist_append(out_list, proxy_out, "udp1");
        out_changes ++;
    }
#endif    

    //
    // INFORM OPERATIONAL MODE
    //
    fprintf(stderr,"--------------------------------------------------------------------------\n");
    fprintf(stderr,"Redirecting UDP. From: *:%s     To: ",options.listen_port_str);

    if (proxy_out) {
        fprintf(stderr,"%s:%s",
            options.remote_host_str, options.remote_port_str);
    }
    if (proxy_out_2) {
        fprintf(stderr,",  %s:%s",
            options.secondary_host_str, options.secondary_port_str);
    }
    fprintf(stderr,"\n");

    if (mqtt_socket) {
        fprintf(stderr,"MQTT: %s:%s  TOPIC: %s\n",
            options.mqtt_host_str, options.mqtt_port_str, options.mqtt_topic_str);
    }

    if (collector_out) {
        fprintf(stderr,"COLLECTOR: %s:%s   MAXIMUM SILENCE (s): %d\n",
            c_host, c_port, options.heartbeat);
    } else {
        fprintf(stderr,"NO COLLECTOR\n");
    }
    fprintf(stderr,"--------------------------------------------------------------------------\n");

    //
    // Prepare Agent
    //

    agent_init(options.heartbeat);

    monitor.dst_host_1 = options.remote_host_str;
    monitor.dst_port_1 = atoi(options.remote_port_str);

    return forward_loop(socket_in, collector_out);
}

