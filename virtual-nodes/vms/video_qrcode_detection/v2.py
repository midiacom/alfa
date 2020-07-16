'''
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
    ! udpsink port=10001

play video
gst-launch-1.0 \
    udpsrc port=10001 caps = "application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, payload=(int)96" \
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
import paho.mqtt.publish as publish
import gi
import sys
import time

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

    # mqtt_topic = sys.argv[1]
    # mqtt_hostname = sys.argv[2]
    # mqtt_port = sys.argv[3]    

    qrcode_time = {}
    qtd_frames = {}
    for x in range(0, 10):
        qtd_frames[x] = 0

    detector = cv2.QRCodeDetector()

    total_frame = 0
    total_qrcode = 0
    total_decode = 0

    ant = ''
    tdecode_ant = 0

    first_frame_detected = 0
    first_frame_detected_time = 0

    while True:
        
        # Wait for the next frame
        if video.frame_available():

            if first_frame_detected == False:
                print(f'\nFirst Frame Detected: {time.time()}\n')

                # fields
                print(f'Data \t Time Detect \t Time Decode \t Diff Time  \t Before Data \t Diff Before Detection ', flush=True)                

            first_frame_detected = True
            
            frame = video.frame()          

            # frame.setflags(write=True)
            # publish.single(mqtt_topic, str(len(face_locations)), hostname=mqtt_hostname, port=int(mqtt_port))
            points = detector.detect(frame)
            
            if points[0] == True: 

                tdetect = time.time()

                data = ''
                while data == '':
                    data = detector.decode(frame,points[1])
                    tdecode = time.time()

                time_diff = tdecode - tdetect
                
                try:
                    if int(ant) < int(data[0]):
                        print(f'{data[0]} \t {tdetect} \t {tdecode} \t {time_diff} \t {ant} \t {tdecode - tdecode_ant}', flush=True)

                        time.sleep(0.5)
                except ValueError:
                    pass      # or whatever1

                ant = data[0]
                tdecode_ant = tdecode

            # sleep
            time.sleep(0.1)
            # data, bbox, _ = detector.detectAndDecode(frame)

            # # if there is a QR code
            # if bbox is not None:
            #     if data == "10":
            #         ant = -1
            #         for i in qrcode_time:
            #             if (ant != -1):
            #                 val = 4 - (qrcode_time[i]-ant)
            #                 print(f' {i};{val}')
            #             ant = qrcode_time[i]
            #         print(qtd_frames)

            #         print(f'QR Code Lidos: {total_decode} ')
            #         print(f'QR Code Somente Identificados: {total_qrcode} ')

            #         sys.exit()

            #     ts = time.time()
            #     qrcode_time[data] = ts
                
            #     total_frame += 1
                
            #     if data == '':
            #         total_qrcode += 1
            #         qtd_frames[0] = qtd_frames[0] + 1
            #     else:
            #         total_decode += 1
            #         qtd_frames[int(data)] = qtd_frames[int(data)] + 1

            #     print(f'{data} - {ts}')
                
            # publish.single(mqtt_topic, str(len(face_locations)), hostname=mqtt_hostname, port=int(mqtt_port))

            # cv2.imshow('frame', frame)
            # if cv2.waitKey(1) & 0xFF == ord('q'):
            #    break
