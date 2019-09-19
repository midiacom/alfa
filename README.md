# Alfa

This is the main project of the Alfa-DVMS. Alfa-DVMS is a manager tool for creating a infrastructere to virtualize câmeras and microphones. The ideas behind this tool is: a single camera can be source of a variaty of plugins that process, manipulate and extract data from the multimedia stream and delivery it for an application that started this plugins remotly via FIWARE.

The final result of this project can be seen at the above images.

<img src="docs/img/vms.png" width="50%">

# Requirements

## Docker

You need a hostwith docker installed AND the API MUST BE enabled! 

To enable the API do it

1 - Navigate to /lib/systemd/system in your terminal and open docker.service file vi /lib/systemd/system/docker.service
2 - Find the line which starts with ExecStart and adds -H=tcp://0.0.0.0:2375 to make it look like
3 - ExecStart=/usr/bin/dockerd -H=fd:// -H=tcp://0.0.0.0:2375
4 - Save the Modified File
5 - Reload the docker daemon: systemctl daemon-reload
6 - Restart the container: sudo service docker restart
7 - Test if it is working by using this command, if everything is fine below command should return a JSON

curl http://localhost:2375/images/json

Important!
Be default the docker API to port: 2375 if you need another port then change the configuration at api/config/dev.env

# To run the API

You need the docker and docker-compose instaled in your machine.

access the folder api and run 

```
docker-compose up
```

# WEB AP

To run the web interface access the folder web-app then run `npm run serve`

We are using this icons lib https://qinshenxue.github.io/vue-icon/

# Types of Suported SRC

* Video Sample Test
* USB devices
* RTSP devices

# Types of Suported VMS

* UDP to UDP
* Crop video and send to UDP
* Greyscale and send to UDP

# Roadmap

* API
* Web Interface
* Plugins: here are some basic plugins that can be used as as template to your own plugins
* FIWARE Integration
