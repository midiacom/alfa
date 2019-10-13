# Alfa

<p align="center">
  <img src="docs/logo_vprism.png" width="50%" alt="Logo V-PRISM">
</p>

This is the main project of the ALFA V-PRISM. ALFA V-PRISM is a manager tool to creating a infrastructure to virtualize cameras and microphones. The ideas behind this tool is: a single camera can be source of a variety of plugins that process, manipulate and extract data from the multimedia stream and delivery it for an application that started this plugins remotely via FIWARE.

The final result of this project can be seen at the above images.

<img src="docs/img/vms.png" width="50%">

# Installation

## Docker and Docker Compose

### Docker 

You need a host with docker and docker-composed installed AND the Docker <strong>API MUST BE </strong> enabled! 

To install docker follow this steps:

https://docs.docker.com/install/linux/docker-ce/ubuntu/

To enable the API do it

```
1 - Navigate to /lib/systemd/system in your terminal and open docker.service file vi /lib/systemd/system/docker.service
2 - Find the line which starts with  ExecStart and replace to ExecStart=/usr/bin/dockerd -H=fd:// -H=tcp://0.0.0.0:2375
3 - Save the Modified File
4 - Reload the docker daemon: systemctl daemon-reload
5 - Restart the container: sudo service docker restart
6 - Test if it is working by using this command, if everything is fine below command should return a JSON

curl http://localhost:2375/images/json
```

Important!
Be default the docker API to port: 2375 if you need another port then change the configuration at api/config/dev.env

### Docker Compose

To install docker compose follow this steps

https://docs.docker.com/compose/install/


## Download the repository 

* Create a new folder to host all the ALFA files;
* Inside this folder run 
```
git clone git@github.com:midiacom/alfa.git .
```

## Build de SRC and the VMS

Before using the system you need to build the Dockerfiles of all SRC and VMS. To do it follow the above steps.

* Access the folder alfa
* Run the command 

```
sudo ./compile_src_and_vms.sh
```

**tip:** if you need to kill all the VMS and SRC you can run **./kill_all_running_src_and_plugins.sh** at this folder

## Build the Web Client

* Install the nodejs packages in web-app and api folder
```
cd web-api
sudo npm install
npm run build
```

## Build the API

You need the docker and docker-compose installed in your machine.

access the folder api and run 

```
cd api
sudo npm install
```

## Run (API, Web Client, Mosquito MQTT and MongoDB)

To run all the ALFA requirements at the root folder run 

```
sudo docker-compose build
sudo docker-compose up
```

Now access the url http://localhost:8081 and import the basic data for start using.

## To Developers 

## Run the Web Client as a Dev

If you are running at development mode you will need nodejs and npm

To run the web interface access the folder web-app then run 

``` 
npm install
npm run serve
``` 

### View Videos in VLC

1 - Create a play.sdp file with the content

```
v=0
c=IN IP4 127.0.0.1
m=video 50000 RTP/AVP 96
a=rtpmap:96 H264/90000
a=fmtp:96 media=video; clock-rate=90000; encoding-name=H264; sprop-parameter-sets=Z2QAFKzZQUH7AWoMAgtKAAADAAIAAAMAeR4oUyw\=\,aOvssiw\=
```

2 - vlc play.sdp

### Gstreamer Packages for development

Install GStreamer on Ubuntu or Debian
Run the following command:

apt-get install libgstreamer1.0-0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav gstreamer1.0-doc gstreamer1.0-tools gstreamer1.0-x gstreamer1.0-alsa gstreamer1.0-gl gstreamer1.0-gtk3 gstreamer1.0-qt5 gstreamer1.0-pulseaudio gstreamer1.0-libav

More details here 
https://gstreamer.freedesktop.org/documentation/installing/on-linux.html?gi-language=c

# Understanding ALFA

## Supported SRC Types

* Video Sample Test: you can create a device that generate the "samples" videos like bars, running balls, snow;
* Audio Sample Test: send a stream of a classical music to test audio;
* Local USB cameras devices: connect to a USB local câmera
* RTSP devices: connect to a device that uses RTSP protocol
* Local Mic devices: connect to a mic device

## Supported VMS Types

* UDP to UDP: forward UDP packages, independently of its content
* Crop video and send to UDP: cut (top, middle, right and left of a video)
* Greyscale and send to UDP: convert a color video into a greyscale one
* Noise Detection: you can define the noise level and the result will be sent to an mqtt server
* Video Merge: grab two video streams and convert it into only one video stream

## Important things to do

* Login and password feature
* Create a way do remove gst_bin_remove_many elements from SRC queue (when stop the VMS)
* Create a VMS that use data from two different SRCs
* Test if using TCP instead of UDP is a better way to communicate VMS and SRC. In this scenario VMS will be the client and SRC will be the server and the bind function will call the VMS to start a new TCP communication with the SRC.
* The binded to column needs to be changed because now a vms can be binded to two or more SRC

### Done 
* Create a "import" to basic configurations (ok)
* Create a mic SRC and noise detector VMS

## Roadmap

* API
* Web Interface
* Plugins: here are some basic plugins that can be used as as template to your own plugins
* FIWARE Integration

# Video Tutorials (in portuguese)

## Introdução ao gsteramer
https://www.youtube.com/watch?v=KLhZmEGeqHk&t=331s

## Criando um programa em C usando gstreamer e rodando em um docker container
https://www.youtube.com/watch?v=GlnXkJnsMGk&feature=youtu.be

# Special Thanks To 
* VUEJS https://vuejs.org/
* Bootstrap VUE https://bootstrap-vue.js.org/
* Lib icons: https://feathericons.com/
* The logo was created by https://www.flaticon.com/free-icon/refraction_308781#term=prism&page=1&position=33

# links importantes

* https://embeddedartistry.com/blog/2018/2/22/generating-gstreamer-pipeline-graphs how to plot dot files from gstreamer pipelines

* http://tordwessman.blogspot.com/2013/06/gstreamer-tee-code-example.html
Example dynamic pad


* https://stackoverflow.com/questions/45700653/can-my-docker-container-app-access-the-hosts-microphone-and-speaker-mac-wind/48795232 Map a mic inside docker container