import qrcode
for x in range(1, 11):
    img = qrcode.make(x, box_size=3)
    img.save('./img/'+str(x).zfill(3)+'.png')