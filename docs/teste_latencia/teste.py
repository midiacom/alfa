#!/usr/bin/python
"""
This is the most simple example to showcase Containernet.
"""
from mininet.net import Containernet
from mininet.node import Controller
from mininet.cli import CLI
from mininet.link import TCLink
from mininet.log import info, setLogLevel
from mininet.node import OVSKernelSwitch, UserSwitch
import time

setLogLevel('info')

net = Containernet(controller=Controller)

info('*** Adding controller\n')
net.addController('c0')

info('*** Adding docker containers\n')
d1 = net.addDocker('d1', ip='10.0.0.251', volumes=["/home/battisti/versionado/alfa/docs/teste:/vol1"], dimage="ubuntu_gstreamer", dcmd="/bin/bash")

# d2 = net.addDocker('d2', ip='10.0.0.252', volumes=["/home/battisti/versionado/alfa/docs/teste:/vol1"], dimage="ubuntu_gstreamer", dcmd="/bin/bash")

# d3 = net.addDocker('d3', ip='10.0.0.253', dimage="alpine_bash", dcmd="/bin/bash")

d2 = net.addDocker(
    'd2', 
    ip='10.0.0.252',
    dimage="alfa/vms/video_qrcode_detection", 
    dcmd="python /root/video_qrcode_detection/v2.py",
    port_bindings={'5000/udp':11002},
    ports=[(5000, 'udp')],
    publish_all_ports=True,
    cpuset_cpus="1")

d3 = net.addDocker(
    'd3', 
    ip='10.0.0.253',
    dimage="alfa/vms/video_qrcode_detection", 
    dcmd="python /root/video_qrcode_detection/v2.py",
    port_bindings={'5000/udp':11003},
    ports=[(5000, 'udp')],
    publish_all_ports=True,
    cpuset_cpus="1")

d4 = net.addDocker(
    'd4', 
    ip='10.0.0.254',
    dimage="alfa/vms/video_qrcode_detection", 
    dcmd="python /root/video_qrcode_detection/v2.py",
    port_bindings={'5000/udp':11004},
    ports=[(5000, 'udp')],
    publish_all_ports=True,
    cpuset_cpus="1")

info('*** Adding switches\n')
s1 = net.addSwitch('s1', cls=OVSKernelSwitch)

info('*** Creating links\n')
# net.addLink(s1, s2, cls=TCLink, bw=1, delay='0ms', loss=5)
# net.addLink(s1, s2, cls=TCLink, bw=1, delay='0ms')

net.addLink(d1, s1, cls=TCLink, bw=100,       delay='0ms', loss=5)
net.addLink(d2, s1, cls=TCLink, bw=100,       delay='50ms')
net.addLink(d3, s1, cls=TCLink, bw=100,       delay='50ms')
net.addLink(d4, s1, cls=TCLink, bw=100,       delay='50ms')

info('*** Starting network\n')
net.start()

info('*** Testing connectivity\n')
net.pingAll()

time.sleep(2)

# colocar aqui um loop e coletar os dados de log dos containers para fazer vários testes
d1.cmd("/vol1/send_video.sh")

info('*** Running CLI\n')
CLI(net)
info('*** Stopping network')
net.stop()


