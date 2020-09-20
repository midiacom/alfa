FROM python:3.9.0rc2-alpine3.12

RUN pip3 install paho-mqtt

COPY . /root/Orchestrator

CMD [ "python", "./root/Orchestrator/Orchestrator.py" ]