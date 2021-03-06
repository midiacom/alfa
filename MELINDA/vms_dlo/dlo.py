# This is the template for the operator running a Decision Level Task
import traceback
import numpy as np
import cv2
import imagezmq
import json

image_hub = imagezmq.ImageHub(open_port='tcp://*:5575')

try:
    while True:  # show streamed images until Ctrl-C
        jsonstr, jpg_buffer = image_hub.recv_jpg()
        jsondata = json.loads(jsonstr)
        image = cv2.imdecode(np.frombuffer(jpg_buffer, dtype='uint8'), -1)
        # cv2.imshow(jsondata['sensor_id'], image)  # One window for each stream

        # Debug
        print("DLO\n", flush=True)
        print(jsondata, flush=True)

        image_hub.send_reply(b'OK')  # REP reply
        # detect any kepresses
        # key = cv2.waitKey(1) & 0xFF
        # if the `q` key was pressed, break from the loop
        # if key == ord("q"):
        #    break

except (KeyboardInterrupt, SystemExit):
    pass  # Ctrl-C was pressed to end program

except Exception as ex:
    print('Python error with no Exception handler:')
    print('Traceback error:', ex)
    traceback.print_exc()

finally:
    cv2.destroyAllWindows()
    print("Done")
