import numpy as np
import cv2

# Create a black image
img = np.zeros((100,100,3), np.uint8)
img.fill(255) # or img[:] = 255
# Draw a diagonal blue line with thickness of 5 px
cv2.rectangle(img,(20,20),(80,80),(255,255,0),3)

for x in range(1, 11):
    cv2.imwrite('./img/'+str(x).zfill(3)+'.png',img)