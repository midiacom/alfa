FROM python:3.6.12-stretch

RUN pip3 install paho-mqtt

COPY . /root/Orchestrator

RUN pip3 install paho-mqtt

ENTRYPOINT ["./root/Orchestrator/start.sh"]

# CMD  ["./root/Orchestrator/start.sh"]
# CMD [ "python", "./root/Orchestrator/Orchestrator.py" ]