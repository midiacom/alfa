# This is a sample Dockerfile you can modify to deploy your own app based on face_recognition

FROM python:3.6.12-stretch

RUN apt-get -y update
RUN apt-get install -y --fix-missing \
    build-essential \
    cmake \
    gfortran \
    git \
    wget \
    curl \
    graphicsmagick \
    libgraphicsmagick1-dev \
    libatlas-dev \
    libavcodec-dev \
    libavformat-dev \
    libgtk2.0-dev \
    libjpeg-dev \
    liblapack-dev \
    libswscale-dev \
    pkg-config \
    python3-dev \
    python3-numpy \
    software-properties-common \
    zip \
    bash \
    python-gi \
    python-gi-cairo \
    python-dbus \
    gir1.2-gtk-3.0 \
    gir1.2-gstreamer-1.0 \
    gir1.2-gst-plugins-base-1.0 \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-pulseaudio \
    gstreamer1.0-plugins-bad \ 
    && apt-get clean && rm -rf /tmp/* /var/tmp/*
    
RUN apt-get install -y --fix-missing \
    python3-gi \
    python3-gst-1.0

RUN python -m pip install --upgrade pip

RUN pip3 install opencv-python
RUN pip3 install numpy==1.15.4

RUN apt-get install -y --fix-missing libgirepository1.0-dev
RUN pip install --no-binary gobject PyGObject 
RUN apt-get install -y --fix-missing gstreamer1.0-libav
RUN apt-get install -y --fix-missing \
    tcpdump \
    net-tools

RUN pip3 install imagezmq

RUN pip3 install imutils

COPY . /root/vms_flo

ENTRYPOINT ["./root/vms_flo/start.sh"]