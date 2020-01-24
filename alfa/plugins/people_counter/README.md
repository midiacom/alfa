# People-Counter
This program count incoming and outcoming people, who crooss by hall. 
  I find many examples in video, how count people who crossing hall or doors, but didn`t find examples code. I decided
write little program, which been counting incoming and outcoming people.
  I use OpenCV and Python 2.7
  So, begining you need install all dependensies:
  
   pip install --trusted-host pypi.python.org -r requirements.txt
   
   sudo python -m pip install --trusted-host pypi.python.org -r requirements.txt

   Use "import" for importing this library in project
   
   For running program write in command line 
   #python PeopleCounterMain.py
   
   If you want chenge video or set stream from rtsp camera change line
   camera = cv2.VideoCapture("test2.mp4") # set here your video
   
   This example use mechanism computer the absolute difference between the current frame and
   first frame, so I compare two frame and if chenges exist i find where. If area bigest more than 
 1200 I draw rectange around object which been chenged, if less than contour is too small, ignore it.

  
