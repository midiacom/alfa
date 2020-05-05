/*
 * @author: Nilson Luís Damasceno
 * @date: 2020-05-03
 */
#include <sys/types.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/socket.h>
#include <netdb.h>
#include <string.h>

#include <sys/time.h>
#include <errno.h>

#include <time.h>

//****************************************************************************************
//
//                                     KEY CONSTANTS
//
//****************************************************************************************
#define MIN_DATAGRAM_BUFFER_SIZE      576
#define MAX_DATAGRAM_SIZE           65536
#define WORK_BUFFER_SIZE            (2 * (MAX_DATAGRAM_SIZE))

#define HEADER_RESERVATION          64

#define LOCAL_SOCKET  1
#define REMOTE_SOCKET 0

#define DEFAULT_COLLECTOR_ID     "UPX_001"
#define DEFAULT_COLLECTOR_HOST   "localhost"
#define DEFAULT_COLLECTOR_PORT   "6001"
#define DEFAULT_HEARTBEAT         60
#define DEFAULT_PORT             "5000"
#define DEFAULT_LOG_PORT         "6001"



//****************************************************************************************
//
//                                 COMMOM DATA AREA
//
//****************************************************************************************
static  char                        io_buffer[MAX_DATAGRAM_SIZE + HEADER_RESERVATION];

static struct {
    char *id_str;
    char *local_port_str;
    char *remote_host_str;     char *remote_port_str;
    char *secondary_host_str;  char *secondary_port_str;
    char *collector_host_str;  char *collector_port_str;
    int   heartbeat;
    int   debug;
    char *log_port_str;
} options = {
    DEFAULT_COLLECTOR_ID,
    NULL, 
    NULL,  DEFAULT_PORT,
    NULL,  DEFAULT_PORT,
    NULL,  DEFAULT_COLLECTOR_PORT,
    DEFAULT_HEARTBEAT,
    0,
    NULL
};

static struct {
    int  initialized;
    int  heartbeat;
    long total_packets;
    long total_bytes;
    struct timespec start0;
    struct timespec start;
} monitor;

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
    fprintf(stderr,"UDP PROXY for V-PRISM    version 0.1\n");
    fprintf(stderr,"------------------------------------\n");
    fprintf(stderr,"Usage: %s [ options ] remote_host1[:remote_port1] [ remote_host2[:remote_port2] ] \n",program);
    fprintf(stderr,"remote_port1              - destination udp port - Default = 5000\n");
    fprintf(stderr,"remote_port2              - destination udp port - Default = 5000\n");
    fprintf(stderr,"Options:\n");
    fprintf(stderr,"  -L log_port             - log mode.\n");
    fprintf(stderr,"  -l listen_port          - listen udp port. Default = 5000\n");
    fprintf(stderr,"  -h help                 - prints this help\n");
    fprintf(stderr,"  -I ID String            - used to identify this instance. Default = UPX_001\n");
    fprintf(stderr,"  -C collector:port       - address of monitor collector. Default = localhost\n");
    fprintf(stderr,"  -H heartbeat            - maximum idle seconds. Default = 60\n");
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
static void parse(int argc, char *argv[]) {
    if (argc < 2) {
        help(argv[0]);
        exit(EXIT_FAILURE);
    } 

#if 0
    // defaults
    #define SET_IF_NULL(A,B) if (!(A)) A = (B);
    SET_IF_NULL(options.local_port_str,"5000");
    SET_IF_NULL(options.remote_port_str,"5000");
    #undef SET_IF_NULL
#endif

    int i;
    char **it;

    // parse options
    for (i=1, it=argv+1; i < argc; i++, it++) {
        if (*it[0] != '-') break;

        if (strcmp(*it,"-l") == 0) {
            i ++;
            it ++;
            options.local_port_str = *it;
        } 
        else
        if (strcmp(*it,"-I") == 0) {
            i ++;
            it ++;
            options.id_str = *it;
        }
        else
        if (strcmp(*it,"-L") == 0) {
            i ++;
            it ++;
            options.log_port_str = *it;
        }
        else
        if (strcmp(*it,"-C") == 0) {
            i ++;
            it ++;
            options.collector_host_str = *it;
            char *s = split_host_port(options.collector_host_str);
            if (s) options.collector_port_str = s;
        }
        else
        if (strcmp(*it,"-D") == 0) {
            options.debug = 1;
        }
        else
        if (strcmp(*it,"-H") == 0) {
            i ++;
            it ++;
            int hb = atoi(*it);
            int err = 0;
            if (!hb) {
                err = (strcmp(*it,"0") != 0);
            } else {
                err = (hb < 10) || (hb > 3600);
            }
            if (!err) {
                options.heartbeat = hb;
            } else {
                perror("HEARTBEAT");
                exit(EXIT_FAILURE);
            }
        }
    }

    if (options.log_port_str) {
        return;
    } 

    if (i < argc) {
        options.remote_host_str = *it;
        char *s = split_host_port(options.remote_host_str);
        if (s) options.remote_port_str = s;
        i++; it++;
    }

    if (i < argc) {
        options.secondary_host_str = *it;
        char *s = split_host_port(options.secondary_host_str);
        if (s) options.secondary_port_str = s;
        i++; it++;
    }

    if (i == argc) {
        if (!options.remote_host_str) {
            fprintf(stderr,"Missing destination_host\n");
            exit(EXIT_FAILURE);
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
static int init_socket(int local_remote, char *host, char *port) {
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
    hints.ai_socktype = SOCK_DGRAM; /* Datagram socket */
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
                freeaddrinfo(result);           /* No longer needed */
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


/************************
 * 
 * 
 *
 */
static void monitor_init(int heartbeat) {
    memset(&monitor,0,sizeof(monitor));
    monitor.initialized = 1;
    monitor.heartbeat = heartbeat;
    
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
static void monitor_heartbeat(void) {
    if (!monitor.heartbeat) return;

    if (!monitor.initialized) {
        perror("monitor not initialized");
        exit(EXIT_FAILURE);
    }
    
    struct timespec stop;
    if (clock_gettime(CLOCK_MONOTONIC, &stop) == -1) {
        perror("clock_gettime");
        exit(EXIT_FAILURE);
    }

    int delta = (stop.tv_sec - monitor.start.tv_sec) * 1000 + 
                  (stop.tv_nsec - monitor.start.tv_nsec) / 1000000;
    
    if (delta < monitor.heartbeat) {
        //fprintf(stderr, "TIMEOUT: %d ms\n", delta);
        return;
    } 

    memcpy(&monitor.start, &stop, sizeof(monitor.start));
    //fprintf(stderr, "**** HEARTBEAT: %d ms\n", delta);
}

static char out_buffer[MAX_DATAGRAM_SIZE];

/************************
 * 
 * 
 *
 */
static void monitor_update(
        int socket, 
        char *src, char *payload, int payload_len, 
        char *dst_host, char *dst_port) {

    monitor.total_bytes += payload_len;
    monitor.total_packets ++;

    if (!socket) return;

    // ------ begin testing -------------
    // converts the from address to string
    struct sockaddr *flex = (struct sockaddr *) src;

    char source[256] = "undefined";

    // IPV4 address to String
    if (flex->sa_family == AF_INET) {
        struct sockaddr_in *ip4 = (struct sockaddr_in *) src;
        char *bytes = (char *) (& ip4->sin_addr.s_addr);
        // assumes little endian architeture
        sprintf(source,"%d.%d.%d.%d:%d", 
            bytes[0],bytes[1],bytes[2],bytes[3], 
            ip4->sin_port);
    }

    // list 
    int len = sprintf(out_buffer,":%s;%s;%s:%s;%d;%8ld,%8ld", 
        options.id_str, 
        source, dst_host, dst_port, 
        payload_len, monitor.total_bytes, monitor.total_packets);

    if (options.debug) {
        fprintf(stderr,": id:%s; %s->%s:%s; bytes:%d; acc: %8ld, packets:%8ld", 
            options.id_str, 
            source, dst_host, dst_port, 
            payload_len, monitor.total_bytes, monitor.total_packets);
    }

    send(socket, out_buffer, len, 0);
}


//****************************************************************************************
//
//                                     LOG MODE   
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

/************************
 * 
 * 
 *
 */
static void log_loop(char *port) {

    int socket_in   = init_socket(LOCAL_SOCKET, NULL, port);

    //
    // INFORM OPERATION MODE
    //
    fprintf(stderr,"--------------------------------------------------------------------------\n");
    fprintf(stderr,"Log mode. Listening on port: %s\n", port);
    fprintf(stderr,"--------------------------------------------------------------------------\n");
    
    char fname[256];
    sprintf(fname, "log_%s.txt", now_as_string("%Y%m%d_%H") );

    FILE *f = fopen(fname, "at");

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
            char *s  = now_as_string("%Y-%m-%d %H:%M:%S");
            if (options.debug) fprintf(stderr,"%s: %s\n", s, payload+1);
            fprintf(f,"%s: %s\n", s, payload+1);
            fflush(f);
        }
    }
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
static void set_socket_timeout(int socket, int seconds) {
    // about time 
    struct timeval tv;
    tv.tv_sec = 1;
    tv.tv_usec = 0;
    if (setsockopt(socket, SOL_SOCKET, SO_RCVTIMEO, &tv,sizeof(tv)) < 0) {
        perror("Error");
    }
}

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
    options.local_port_str = "2001";  options.remote_port_str = "2002";

    parse(argc, argv);

    if (options.log_port_str) {
        log_loop(options.log_port_str);
        return 0;
    } 

    struct sockaddr_in dst_in;
    struct sockaddr_in mon_in;

    char *dst_host = options.remote_host_str;
    char *dst_port = options.remote_port_str;

    char *sec_host = options.secondary_host_str;
    char *sec_port = options.secondary_port_str;

    char *c_host = options.collector_host_str;
    char *c_port = options.collector_port_str;

    //
    // SOCKETS
    //
    int socket_in   = init_socket(LOCAL_SOCKET, NULL, options.local_port_str);
    int proxy_out   = init_socket(REMOTE_SOCKET, dst_host, dst_port);
    int proxy_out_2 = init_socket(REMOTE_SOCKET, sec_host, sec_port);
    int collector_out = init_socket(REMOTE_SOCKET, c_host, c_port);
    set_socket_timeout(socket_in, 1);

    //
    // INFORM OPERATION MODE
    //
    fprintf(stderr,"--------------------------------------------------------------------------\n");
    fprintf(stderr,"Redirecting UDP from: *:%s -> %s:%s",
        options.local_port_str, 
        options.remote_host_str, options.remote_port_str);

    if (proxy_out_2) {
        fprintf(stderr," & %s:%s",
            options.secondary_host_str, options.secondary_port_str);
    }
    fprintf(stderr,"\n");

    if (collector_out) {
        fprintf(stderr,"MONITOR: %s:%s   HEARTBEAT: %d\n",
            c_host, c_port, options.heartbeat);
    } else {
        fprintf(stderr,"NO MONITOR\n");
    }
    fprintf(stderr,"--------------------------------------------------------------------------\n");

    // ready to handle for non ipv4 addresses
    char flex_src_addr[256];

    monitor_init(options.heartbeat);
    
    // payload area begins after a header reservation
    // useful to "forge" a fake packet around the payload 
    // to send as "sample packet"
    char *payload = io_buffer + HEADER_RESERVATION;

    int exit_mode = EXIT_SUCCESS;

    // loop forever
    while (1) {

        //
        // Receive
        //
        socklen_t src_in_len = sizeof(flex_src_addr);
        int payload_len = recvfrom(socket_in, payload, MAX_DATAGRAM_SIZE, 
                MSG_WAITALL, (struct sockaddr*) &flex_src_addr, &src_in_len);
        int err = errno;

        if (payload_len <= 0) {
            if (err == EAGAIN) {
                if (collector_out) {
                    monitor_heartbeat(); // send a heartbeat
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
        // send to collector
        //
        if (collector_out) {
            monitor_update(collector_out, flex_src_addr, 
                payload, payload_len, 
                dst_host, dst_port);
        }
    
        //
        // Forward part
        //
        send(proxy_out, payload, payload_len, 0);
        
        //
        // Secondary forward
        //
        if (proxy_out_2) {
            send(proxy_out_2, payload, payload_len, 0);
        }
    }
    
    return exit_mode;
}
