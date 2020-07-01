import cv2
import numpy as np

base_image = cv2.imread("back_small.png")
# base_image = cv2.imread("back.jpg")
x_offset=y_offset=15

mean = 10   # some constant
std = 10.0    # some constant (standard deviation)

for x in range(1, 10):
    s_img = cv2.imread("./img/"+str(x).zfill(3)+".png")    
    l_img = base_image + np.random.normal(mean, std, base_image.shape)
    cv2.imwrite('./video/001_'+str(x)+'_a.png', l_img)

for x in range(1, 11):
    
    s_img = cv2.imread("./img/"+str(x).zfill(3)+".png")    

    l_img = base_image + np.random.normal(mean, std, base_image.shape)

    l_img[y_offset:y_offset+s_img.shape[0], x_offset:x_offset+s_img.shape[1]] = s_img

    cv2.imwrite('./video/'+str(x).zfill(3)+'_a.png', l_img)

    imarray = np.random.rand(l_img.shape[0],l_img.shape[1],3) * 255
    l_img = imarray
    cv2.imwrite('./video/'+str(x).zfill(3)+'_b.png', l_img)