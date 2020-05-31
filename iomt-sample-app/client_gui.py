import argparse
import requests

parser = argparse.ArgumentParser(description='V-PRISM VMS creation example')

# example
#  python3 client_gui.py --vprism_url=http://127.0.0.1:3000 --location=5ed2b3044441a11c1474e138 --vms_type=alfa/vms/udp_to_udp --bind_port=5000 --output_type=video --to_ip=192.168.0.150 --to_port=10026
# 5ed2b25c4441a11c1474e137

parser.add_argument("--vprism_url", required=True, help="The URL of V-PRISM url:port.")
parser.add_argument("--location", required=True, help="The location ID where the data will come from.", type=str)
parser.add_argument("--vms_type", required=True, help="The name of the VMS Image. For example: alfa/vms/udp_to_udp", type=str)
parser.add_argument("--startup_parameter",required=False, help="The startups parameters of the VMS", type=str)
parser.add_argument("--bind_port", required=True, help="In which port of the VMS the Virtual Device will send the stream", type=str)
parser.add_argument("--output_type", required=True, help="If the created VMS will output a video or a audio stream.", type=str)
parser.add_argument("--to_ip", required=True, help="The IP where the stream will be processed.", type=str)
parser.add_argument("--to_port", required=True, help="The PORT where the stream will be processed.", type=str)

args = parser.parse_args()

p = {
    'locationId': args.location,    
    'outputType': args.output_type,
    'vmsType': args.vms_type,
    'toIp': args.to_ip,
    'toPort': args.to_port,
    'bindPort': args.bind_port,
    'startupParameters': ""
}

if args.startup_parameter != None:
    p.startup_parameter = args.startup_parameter

req = requests.post(args.vprism_url+'/maestro/vmsCreation', data=p)

print(req)
