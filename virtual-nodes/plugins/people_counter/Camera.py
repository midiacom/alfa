import numpy as np
import cv2
import imutils


class Camera:

    @staticmethod
    def start_capturing(stream_path):
        cap = cv2.VideoCapture(stream_path)

        while (cap.isOpened()):
            ret, frame = cap.read()

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            cv2.imshow('frame', gray)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()