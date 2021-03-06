# This is the template for the operator running a Measurement Level Task
# start example:

# Run inside a Docker container
# python3 MLO.py --IP=tcp://172.17.0.1:5555

# Run at localhost
# python3 MLO.py --IP=tcp://localhost:5555

import socket
import time
import traceback
import argparse
import cv2
from imutils.video import VideoStream
import imagezmq

parser = argparse.ArgumentParser("MLO Example")
parser.add_argument("--IP", help="IP and PORT where the image broker is running. Example: tcp://IP:PORT;IP:PORT.", type=str)
args = parser.parse_args()

broker_url = args.IP

# broker_url = 'tcp://172.17.0.1:5555'
sender = imagezmq.ImageSender(connect_to=broker_url)

node_name = socket.gethostname()  # send RPi hostname with each image
camera = VideoStream(usePiCamera=False).start()
time.sleep(2.0)    # allow camera sensor to warm up
jpeg_quality = 90  # 0 to 100, higher is better quality, 95 is cv2 default

try:
    while True:  # send images as stream until Ctrl-C
        image = camera.read()
        ret_code, jpg_buffer = cv2.imencode(
            ".jpg", image, [int(cv2.IMWRITE_JPEG_QUALITY), jpeg_quality])
        sender.send_jpg(node_name, jpg_buffer)

except (KeyboardInterrupt, SystemExit):
    pass  # Ctrl-C was pressed to end program

except Exception as ex:
    print('Python error with no Exception handler:')
    print('Traceback error:', ex)
    traceback.print_exc()

finally:
    camera.stop()  # stop the camera thread
    sender.close()  # close the ZMQ socket and context

