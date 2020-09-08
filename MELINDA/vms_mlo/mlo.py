'''
LIB USED
    https://github.com/MikhailGordeev/QR-Code-Extractor

Send video
gst-launch-1.0  videotestsrc pattern=ball \
     ! tee name=t \
     ! queue \
     ! decodebin \
     ! x264enc \
     ! rtph264pay \
     ! udpsink host=localhost port=5000

python3 mlo.py --IP=tcp://172.17.0.1:5555

gst-launch-1.0 multifilesrc loop=true  location=/home/battisti/versionado/experimentos_dissertacao/dataloss/latencia.mp4 \
    ! decodebin \
    ! videoscale \
    ! video/x-raw,width=800,height=600 \
    ! x264enc \
    ! rtph264pay \
    ! udpsink port=5000 

    host=172.17.0.2

gst-launch-1.0 v4l2src device=/dev/video0 \
    ! tee name=t \
    ! queue \
    ! decodebin \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=5000     
'''

import cv2
import numpy as np
import gi
import sys
import socket
import time
import traceback
import argparse
import imagezmq
import qr_extractor as reader
import json
import datetime

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
    try:
        jpeg_quality = 90  # 0 to 100, higher is better quality, 95 is cv2 default

        # Create the video object
        video = Video()

        parser = argparse.ArgumentParser("MLO Example")
        parser.add_argument("--IP", help="IP and PORT where the image broker is running. Example: tcp://IP:PORT;IP:PORT.", type=str)
        args = parser.parse_args()

        sender = imagezmq.ImageSender(connect_to=args.IP)

        node_name = socket.gethostname()  # send RPi hostname with each image

        # read the image
        # image_frame = cv2.imread('/home/battisti/versionado/alfa/MELINDA/vms_mlo/code.jpg')
        # codes, image_frame = reader.extract(image_frame, False)        
        # cv2.imwrite("./frame.jpg", codes[0])
                
        while True:
            # Wait for the next frame
            if not video.frame_available():
                continue

            time.sleep(0.1)
            frame = video.frame()
        
            # cv2.imwrite('frame.jpg', frame)

            # remove the comment to show a video frame, not work inside docker container
            # cv2.imshow('frame', frame)
            # if cv2.waitKey(1) & 0xFF == ord('q'):
            #     break

            codes, image_frame = reader.extract(frame, False)

            if len(codes):
                print(1)
                timestamp = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S-%f')
                ret_code, jpg_buffer = cv2.imencode(
                    ".jpg", image_frame, [int(cv2.IMWRITE_JPEG_QUALITY), jpeg_quality])
                jsondata = {'sensor_id': node_name,
                            'timestamp': timestamp}
                jsonstr = json.dumps(jsondata)

                # Debug
                print("MLO\n", flush=True)
                print(jsonstr, flush=True)

                sender.send_jpg(jsonstr, jpg_buffer)

                # ret_code, jpg_buffer = cv2.imencode(
                #     ".jpg", image_frame, [int(cv2.IMWRITE_JPEG_QUALITY), jpeg_quality])
                # sender.send_jpg(node_name, jpg_buffer)

    except (KeyboardInterrupt, SystemExit):
        pass  # Ctrl-C was pressed to end program

    except Exception as ex:
        print('Python error with no Exception handler:')
        print('Traceback error:', ex)
        traceback.print_exc()

    finally:
        # cv2.destroyAllWindows()
        print("Done")



# VERSÃO ANTERIOR RODANDO 
# if __name__ == '__main__':
#     # Create the video object
#     video = Video()

#     parser = argparse.ArgumentParser("MLO Example")
#     parser.add_argument("--IP", help="IP and PORT where the image broker is running. Example: tcp://IP:PORT;IP:PORT.", type=str)
#     args = parser.parse_args()

#     sender = imagezmq.ImageSender(connect_to=args.IP)

#     node_name = socket.gethostname()  # send RPi hostname with each image

#     jpeg_quality = 90  # 0 to 100, higher is better quality, 95 is cv2 default

#     while True:
#         # Wait for the next frame
#         if not video.frame_available():
#             continue

#         time.sleep(0.1)

#         frame = video.frame()
        
#         ret_code, jpg_buffer = cv2.imencode(
#             ".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), jpeg_quality])                

#         sender.send_jpg(node_name, jpg_buffer)

#         # cv2.imshow('frame', frame)
#         # if cv2.waitKey(1) & 0xFF == ord('q'):
#         #    break