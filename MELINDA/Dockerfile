FROM python:3.6-slim-stretch

RUN apt-get -y update
RUN apt-get -y install iputils-ping
RUN apt-get -y install procps

RUN pip3 install imagezmq

RUN pip3 install opencv-python

RUN apt-get -y install libgl1-mesa-glx
RUN apt-get -y install libglib2.0-0


COPY ./start.sh .
COPY ./Broker.py .

ENTRYPOINT ["./start.sh"]

# RUN apt-get install -y --fix-missing \
#     build-essential \
#     cmake \
#     gfortran \
#     git \
#     wget \
#     curl \
#     graphicsmagick \
#     libgraphicsmagick1-dev \
#     libatlas-dev \
#     libavcodec-dev \
#     libavformat-dev \
#     libgtk2.0-dev \
#     libjpeg-dev \
#     liblapack-dev \
#     libswscale-dev \
#     pkg-config \
#     python3-dev \
#     python3-numpy \
#     software-properties-common \
#     zip \
#     bash \
#     python-gi \
#     python-gi-cairo \
#     python-dbus \
#     gir1.2-gtk-3.0 \
#     gir1.2-gstreamer-1.0 \
#     gir1.2-gst-plugins-base-1.0 \
#     gstreamer1.0-plugins-base \
#     gstreamer1.0-plugins-good \
#     gstreamer1.0-plugins-ugly \
#     gstreamer1.0-pulseaudio \
#     gstreamer1.0-plugins-bad \ 
#     && apt-get clean && rm -rf /tmp/* /var/tmp/*

# RUN cd ~ && \
#     mkdir -p dlib && \
#     git clone -b 'v19.9' --single-branch https://github.com/davisking/dlib.git dlib/ && \
#     cd  dlib/ && \
#     python3 setup.py install --yes USE_AVX_INSTRUCTIONS


# # The rest of this file just runs an example script.

# # If you wanted to use this Dockerfile to run your own app instead, maybe you would do this:
# # COPY . /root/your_app_or_whatever
# # RUN cd /root/your_app_or_whatever && \
# #     pip3 install -r requirements.txt
# # RUN whatever_command_you_run_to_start_your_app

# RUN apt-get install -y --fix-missing \
#     python3-gi \
#     python3-gst-1.0

# RUN python -m pip install --upgrade pip

# RUN pip3 install paho-mqtt
# RUN pip3 install opencv-python
# RUN pip3 install numpy==1.15.4
# RUN pip3 install face_recognition

# RUN apt-get install -y --fix-missing libgirepository1.0-dev
# RUN pip install --no-binary gobject PyGObject 
# RUN apt-get install -y --fix-missing gstreamer1.0-libav
# RUN apt-get install -y --fix-missing \
#     tcpdump \
#     net-tools

