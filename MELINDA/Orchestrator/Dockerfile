FROM python:3.9.0rc2-alpine3.12

RUN pip3 install paho-mqtt

COPY . /root/Orchestrator

RUN pip3 install imagezmq

ENTRYPOINT ["./root/Orchestrator/start.sh"]

#CMD [ "python", "./root/Orchestrator/Orchestrator.py" ]