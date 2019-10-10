#!/bin/bash

url="http://localhost:3000"

if [ "$1" = "listDevices" ]; then
    curl -H "Accept:application/json" $url"/device/"
fi