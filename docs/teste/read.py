import cv2

# read the QRCODE image

img = cv2.imread("./video/10.png")

detector = cv2.QRCodeDetector()

data, bbox, _ = detector.detectAndDecode(img)

# if there is a QR code
if bbox is not None:
    print(f"QRCode data:\n{data}")