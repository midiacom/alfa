#!/bin/bash
clear
echo " +-----------------+"
echo "  ALFA Instalation  "
echo " +-----------------+"

echo "Web Interface URL: (localhost)"
read weburl

if [ -z $weburl ]; then
    weburl="localhost"
fi

echo "API URL: (127.0.0.1)"
read apiurl

if [ -z $apiurl ]; then
    apiurl="127.0.0.1"
fi

rm "web-app/.env"
touch "web-app/.env"
echo VUE_APP_MY_URL_API = \'http://$apiurl:3000\' >> web-app/.env
echo VUE_APP_MY_URL_APP = \'http://$weburl:8080\' >> web-app/.env

echo "Installing web client"
cd web-app 
npm install
npm run build

echo "Installing npm packages"
cd ../api
npm install

echo "Running Server"
cd ..
sudo docker-compose build
sudo docker-compose up