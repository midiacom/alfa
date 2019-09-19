# Alfa

This is the main project of the Alfa-DVMS. Alfa-DVMS is a manager tool for creating a infrastructere to virtualize câmeras and microphones. The ideas behind this tool is: a single camera can be source of a variaty of plugins that process, manipulate and extract data from the multimedia stream and delivery it for an application that started this plugins remotly via FIWARE.

The final result of this project can be seen at the above images.

<img src="docs/img/vms.png" width="50%">

# Docker

You need a docker host with the API enabled! 

To do it

1 - Navigate to /lib/systemd/system in your terminal and open docker.service file vi /lib/systemd/system/docker.service
2 - Find the line which starts with ExecStart and adds -H=tcp://0.0.0.0:2375 to make it look like
3 - ExecStart=/usr/bin/dockerd -H=fd:// -H=tcp://0.0.0.0:2375
4 - Save the Modified File
5 - Reload the docker daemon: systemctl daemon-reload
6 - Restart the container: sudo service docker restart
7 - Test if it is working by using this command, if everything is fine below command should return a JSON

curl http://localhost:2375/images/json

Important!

Configure the docker API to port: 2375

# To run the API

You need the docker and docker-compose instaled in your machine.

docker-compose up

To API access the Docker API is necessary that it started with this feature

Edit the file sudo vi /lib/systemd/system/docker.service

Modify the line that starts with ExecStart to look like this:
ExecStart=/usr/bin/docker daemon -H fd:// -H tcp://0.0.0.0:4243

systemctl daemon-reload
sudo service docker restart
curl http://localhost:4243/version

#web app

We are using this icons lib https://qinshenxue.github.io/vue-icon/

# Roadmap

* API
* Web Interface
* Plugins: here are some basic plugins that can be used as as template to your own plugins
* FIWARE Integration



