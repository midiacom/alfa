'''
sudo tcpdump -i lo port 5000

https://github.com/jeremyfix/udp_video_streaming/tree/master/udp_socket

send udp video
https://raspberrypi.stackexchange.com/questions/70911/write-in-gstreamer-pipeline-from-opencv-in-python

send video to container
gst-launch-1.0 filesrc location=/home/battisti/versionado/alfa/alfa/plugins/face_counter/test4.mp4 \
    ! decodebin \
    ! videoscale \
    ! video/x-raw,width=800,height=600 \
    ! x264enc \
    ! rtph264pay \
    ! udpsink port=10001 host=172.17.0.2

send video to machine
gst-launch-1.0 filesrc location=/home/battisti/versionado/alfa/alfa/plugins/face_counter/test4.mp4 \
    ! decodebin \
    ! videoscale \
    ! video/x-raw,width=800,height=600 \
    ! x264enc \
    ! rtph264pay \
    ! udpsink port=5000

play video
gst-launch-1.0 \
    udpsrc port=10003 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
    ! queue2 max-size-bytes=65536 max-size-buffers=65536 max-size-time=10 \
    ! rtph264depay \
    ! decodebin \
    ! videoconvert \
    ! autovideosink

docker build . -t alfa/plugin/face_counter
docker run --name face_counter alfa/plugin/face_counter
docker run -it alfa/plugin/face_counter sh 

docker run alfa/plugin/face_counter 172.17.0.1 5000

python /root/face_counter/face_counter.py xyz 172.17.0.1 1883

python3 face_counter.py tx 172.17.0.1 1883


# start python server python3 -m http.server 80
# CMD python3 /root/face_recognition/face_counter.py
# python /root/face_counter/face_counter.py

'''

import cv2
import numpy as np
import gi
import sys

gi.require_version('Gst', '1.0')
from gi.repository import Gst

class Video():
    """BlueRov video capture class constructor
    Attributes:
        port (int): Video UDP port
        video_codec (string): Source h264 parser
        video_decode (string): Transform YUV (12bits) to BGR (24bits)
        video_pipe (object): GStreamer top-level pipeline
        video_sink (object): Gstreamer sink element
        video_sink_conf (string): Sink configuration
        video_source (string): Udp source ip and port
    """

    def __init__(self, port=5000):
        """Summary
        Args:
            port (int, optional): UDP port
        """

        Gst.init(None)

        self.port = port
        self._frame = None


        # [Software component diagram](https://www.ardusub.com/software/components.html)
        # UDP video stream (:5600)
        self.video_source = 'udpsrc port={}'.format(self.port)
        # [Rasp raw image](http://picamera.readthedocs.io/en/release-0.7/recipes2.html#raw-image-capture-yuv-format)
        # Cam -> CSI-2 -> H264 Raw (YUV 4-4-4 (12bits) I420)
        self.video_codec = '! application/x-rtp, payload=96 ! rtph264depay ! h264parse ! avdec_h264'
        # Python don't have nibble, convert YUV nibbles (4-4-4) to OpenCV standard BGR bytes (8-8-8)
        self.video_decode = \
            '! queue2 max-size-bytes=655360 max-size-buffers=655360 max-size-time=100 ! decodebin ! videoconvert ! video/x-raw,format=(string)BGR ! videoconvert '
        # Create a sink to get data
        self.video_sink_conf = \
            '! appsink emit-signals=true sync=false max-buffers=2 drop=true'

        self.video_pipe = None
        self.video_sink = None

        self.run()

    def start_gst(self, config=None):
        """ Start gstreamer pipeline and sink
        Pipeline description list e.g:
            [
                'videotestsrc ! decodebin', \
                '! videoconvert ! video/x-raw,format=(string)BGR ! videoconvert',
                '! appsink'
            ]
        Args:
            config (list, optional): Gstreamer pileline description list
        """

        if not config:
            config = \
                [
                    'videotestsrc ! decodebin',
                    '! videoconvert ! video/x-raw,format=(string)BGR ! videoconvert',
                    '! appsink'
                ]

        command = ' '.join(config)
        self.video_pipe = Gst.parse_launch(command)
        self.video_pipe.set_state(Gst.State.PLAYING)
        self.video_sink = self.video_pipe.get_by_name('appsink0')

    @staticmethod
    def gst_to_opencv(sample):
        """Transform byte array into np array
        Args:
            sample (TYPE): Description
        Returns:
            TYPE: Description
        """
        buf = sample.get_buffer()
        caps = sample.get_caps()
        array = np.ndarray(
            (
                caps.get_structure(0).get_value('height'),
                caps.get_structure(0).get_value('width'),
                3
            ),
            buffer=buf.extract_dup(0, buf.get_size()), dtype=np.uint8)
        return array

    def frame(self):
        """ Get Frame
        Returns:
            iterable: bool and image frame, cap.read() output
        """
        return self._frame

    def frame_available(self):
        """Check if frame is available
        Returns:
            bool: true if frame is available
        """
        return type(self._frame) != type(None)

    def run(self):
        """ Get frame to update _frame
        """

        self.start_gst(
            [
                self.video_source,
                self.video_codec,
                self.video_decode,
                self.video_sink_conf
            ])

        self.video_sink.connect('new-sample', self.callback)

    def callback(self, sink):
        sample = sink.emit('pull-sample')
        new_frame = self.gst_to_opencv(sample)
        self._frame = new_frame

        return Gst.FlowReturn.OK


if __name__ == '__main__':
    # Create the video object
    # Add port= if is necessary to use a different one
    video = Video()
    send_video = Video()

    # fourcc = cv2.VideoWriter_fourcc(*'MJPG')
    # out = cv2.VideoWriter('appsrc | rtph264depay ! decodebin ! x264enc ! rtph264pay ! udpsink host=127.0.0.1 port=10003',fourcc, 20.0, (640, 480))
    # out = cv2.VideoWriter('appsrc ! queue ! videoconvert ! video/x-raw ! omxh264enc ! video/x-h264 ! h264parse ! rtph264pay ! udpsink port=10003 sync=false',0,25.0,(640,480))

    # out = cv2.VideoWriter('appsrc ! queue ! videoconvert ! video/x-raw ! omxh264enc ! video/x-h264 ! h264parse ! rtph264pay ! udpsink host=192.168.0.1 port=10331 sync=false',0,25.0,(640,480))
    # out = cv2.VideoWriter('appsrc ! queue ! videoconvert ! video/x-raw ! x264enc ! h264parse ! rtph264pay ! autovideosink',0,25.0,(640,480))
    # host=192.168.0.1

    pipeline = send_video.start_gst(['videotestsrc ! decodebin', '! videoconvert ! video/x-raw,format=(string)BGR ! videoconvert','! appsink'])

    # out = cv2.VideoWriter('appsrc ! queue ! videoconvert ! video/x-raw ! x264enc ! h264parse ! rtph264pay ! udpsink host="192.168.0.1" port="10331" sync=false',0,25.0,(640,480))

    # Gst.debug_bin_to_dot_file(pipeline,-1,'/tmp/teste.dot')

    while True:
        # Wait for the next frame
        if not video.frame_available():
            continue

        frame = video.frame()
        
        frame.setflags(write=True)

        frame = ~frame

        # print(frame.tobytes())

        out.write(frame)

        # cv2.imshow('frame', frame)
        # if cv2.waitKey(1) & 0xFF == ord('q'):
            # break