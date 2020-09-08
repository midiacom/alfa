# This is the template for the operator running a Feature Level Task
import traceback
import numpy as np
import cv2
import imagezmq
from imutils import resize
import json

jpeg_quality = 90
image_hub = imagezmq.ImageHub(open_port='tcp://*:5565')

try:

    detector = cv2.QRCodeDetector()

    while True:
        jsonstr, jpg_buffer = image_hub.recv_jpg()
        jsondata = json.loads(jsonstr)
        jsondata['jpeg_quality'] = jpeg_quality
        # print("Received image from {}".format(node_name))
        image = cv2.imdecode(np.frombuffer(jpg_buffer, dtype='uint8'), -1)
        image = resize(image, width=400)
        _, jpg_buffer = cv2.imencode(".jpg", image,
                                     [int(cv2.IMWRITE_JPEG_QUALITY), jpeg_quality])
  

        data, bbox, _ = detector.detectAndDecode(image)

        # if there is a QR code
        jsondata['qrcode_value'] = 'error'

        if bbox is not None:      
            jsondata['qrcode_value'] = data
            print(data, flush=True)
            print(jsondata, flush=True)

        jsonstr = json.dumps(jsondata)

        # Debug
        print("FLO\n", flush=True)
        print(jsonstr, flush=True)

        image_hub.send_reply(jsonstr.encode('utf-8'))        

    # funcionando
    # detector = cv2.QRCodeDetector()

    # while True:
    #     node_name, jpg_buffer = image_hub.recv_jpg()

    #     # print("Received image from {}".format(node_name))
    #     image = cv2.imdecode(np.frombuffer(jpg_buffer, dtype='uint8'), -1)

    #     data, bbox, _ = detector.detectAndDecode(image)

    #     # if there is a QR code
    #     msg = b'OK'
    #     if bbox is not None:      
    #         msg = data.encode()
    #         print(data, flush=True)

    #     image_hub.send_reply(msg)

except (KeyboardInterrupt, SystemExit):
    pass  # Ctrl-C was pressed to end program

except Exception as ex:
    print('Python error with no Exception handler:')
    print('Traceback error:', ex)
    traceback.print_exc()

finally:
    print("Done")

# try:
#     while True:
#         node_name, jpg_buffer = image_hub.recv_jpg()

#         # print("Received image from {}".format(node_name))
#         image = cv2.imdecode(np.frombuffer(jpg_buffer, dtype='uint8'), -1)

#         image = resize(image, width=400)
#         _, jpg_buffer = cv2.imencode(".jpg", image,
#                                      [int(cv2.IMWRITE_JPEG_QUALITY), jpeg_quality])

#         image_hub.send_reply(jpg_buffer)

# except (KeyboardInterrupt, SystemExit):
#     pass  # Ctrl-C was pressed to end program

# except Exception as ex:
#     print('Python error with no Exception handler:')
#     print('Traceback error:', ex)
#     traceback.print_exc()

# finally:
#     print("Done")