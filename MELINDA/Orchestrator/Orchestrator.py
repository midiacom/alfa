# This is the Orchestrator component managing the nodes allocation and deploying workflows
# python3 Orchestrator.py --FPS=45 --MQTT_HOST=mosquito --MQTT_PORT=1883 --MQTT_TOPIC_NODES=nodes_list --MQTT_TOPIC_RESPONSE=nodes_response
# python3 Orchestrator.py --FPS=45 --MQTT_HOST=172.17.0.1 --MQTT_PORT=1883 --MQTT_TOPIC_NODES=nodes_list --MQTT_TOPIC_RESPONSE=nodes_response

from statistics import stdev
import argparse
import paho.mqtt.publish as publish
import paho.mqtt.subscribe as subscribe
import json

parser = argparse.ArgumentParser("MLO Example")
parser.add_argument("--FPS", help="The total of FPS generated by the camera.", type=int)
parser.add_argument("--MQTT_HOST", help="IP where the message broker MQTT is running. Example: localhost.", type=str)
parser.add_argument("--MQTT_PORT", help="PORT where the message broker MQTT is running. Example: 1883.", type=int)
parser.add_argument("--MQTT_TOPIC_NODES", help="Topic where the edge nodes and it's values are informed.", type=str)
parser.add_argument("--MQTT_TOPIC_RESPONSE", help="Topic where the response must be placed.", type=str)

args = parser.parse_args()

# Weights (as costs) to select the best nodes combination to attend a workflow demand
waste_weight = 4.0
num_nodes_weight = 2.0
std_fd_weight = 1.0

# Workflow demand in FPS
workflow_fps_demand = args.FPS

nodes = ()

# def on_message_print(client, userdata, message):
#     # Parse JSON into an object with attributes corresponding to dict keys.
#     nodes = json.loads(message.payload, object_hook=lambda d: SimpleNamespace(**d))    

# subscribe.callback(on_message_print, args.MQTT_TOPIC_NODES, hostname=args.MQTT_HOST, port=args.MQTT_PORT)

print("a")
message = subscribe.simple(args.MQTT_TOPIC_NODES, hostname=args.MQTT_HOST, port=args.MQTT_PORT)

nodes = json.loads(message.payload)

print(nodes)

def SelectNodes(fps_demand, nodes):
    nodes = sorted(nodes.items(), key=lambda x: x[1], reverse=True)
    solutions = []
    for pivot in range(len(nodes)):
        sum_capacity = nodes[pivot][1]
        partial_solution = [nodes[pivot]]
        if sum_capacity >= fps_demand:
            solutions.append(partial_solution)
        else:
            for i in range(pivot + 1, len(nodes)):
                cap = fps_demand - sum_capacity
                try:
                    index = [x[1] for x in nodes[i:]].index(cap) + i
                except ValueError:
                    index = None
                if index is not None:
                    sum_capacity += nodes[index][1]
                    partial_solution.append(nodes[index])
                    solutions.append(partial_solution)
                    break
                cap = sum_capacity + nodes[i][1]
                if cap >= fps_demand:
                    possible_solution = partial_solution.copy()
                    possible_solution.append(nodes[i])
                    solutions.append(possible_solution)
                else:
                    sum_capacity += nodes[i][1]
                    partial_solution.append(nodes[i])

    if len(solutions) > 0:
        best_solution = best_solution_cost = 99999
        for i, combination in enumerate(solutions):
            total_fps = sum([element[1] for element in combination])
            waste = total_fps - workflow_fps_demand
            num_nodes = len(combination)
            frames_distribution = 0 if len(combination) == 1 else stdev([element[1] for element in combination])
            cost = waste * waste_weight + num_nodes * num_nodes_weight + frames_distribution * std_fd_weight
            if cost < best_solution_cost:
                best_solution_cost = cost
                best_solution = i
        return solutions[best_solution]
    else:
        return solutions


def main():
    mlo_nodes = {}
    for node in nodes:
        mlo_nodes[node['edgeNodeId']] = node['mlo']
    mlo_nodes_selected = SelectNodes(workflow_fps_demand, mlo_nodes)

    flo_nodes = {}
    for node in nodes:
        if node['edgeNodeId'] not in [x[0] for x in mlo_nodes_selected]:
            flo_nodes[node['edgeNodeId']] = node['flo']

    flo_nodes_selected = SelectNodes(workflow_fps_demand, flo_nodes)

    dlo_nodes = {}
    for node in nodes:
        if node['edgeNodeId'] not in [x[0] for x in mlo_nodes_selected] and \
           node['edgeNodeId'] not in [x[0] for x in flo_nodes_selected]:
            dlo_nodes[node['edgeNodeId']] = node['dlo']
    dlo_nodes_selected = SelectNodes(workflow_fps_demand, dlo_nodes)
    print("Nodes selected to attend a workflow demanding {} FPS of processing capacity:".format(workflow_fps_demand))
    print("MLO operators: {}".format(mlo_nodes_selected))
    print("FLO operators: {}".format(flo_nodes_selected))
    print("DLO operators: {}".format(dlo_nodes_selected))

    ##############################################
    # Generate the dict to post in the mqtt toppic
    ##############################################
    result = {
        "mlo_nodes": mlo_nodes_selected,
        "flo_nodes": flo_nodes_selected,
        "dlo_nodes": dlo_nodes_selected
    }

    publish.single(args.MQTT_TOPIC_RESPONSE, str(result), hostname=args.MQTT_HOST, port=int(args.MQTT_PORT))
    ###############################################

if __name__ == "__main__":
    main()


##############################################
# Get the idle nodes from the MQTT Server
##############################################
# Idle nodes available for processing a new workflow
# nodes = [{'edgeNodeId': '5f2484b37c803900291ea3d0', 'mlo': 5, 'flo': 20, 'dlo': 30},
#          {'edgeNodeId': '5f2484b37c803900291ea3d1', 'mlo': 1, 'flo': 10, 'dlo': 50},
#          {'edgeNodeId': '5f2484b37c803900291ea3d2', 'mlo': 10, 'flo': 25, 'dlo': 90},
#          {'edgeNodeId': '5f2484b37c803900291ea3d3', 'mlo': 40, 'flo': 30, 'dlo': 10},
#          {'edgeNodeId': '5f2484b37c803900291ea3d4', 'mlo': 3, 'flo': 20, 'dlo': 10},
#          {'edgeNodeId': '5f2484b37c803900291ea3d5', 'mlo': 20, 'flo': 10, 'dlo': 10}]

# print(args.MQTT_TOPIC_NODES)
# print(args.MQTT_HOST)
# print(args.MQTT_PORT)


# result = {
#     "mlo_nodes": mlo_nodes_selected,
#     "flo_nodes": flo_nodes_selected,
#     "dlo_nodes": dlo_nodes_selected
# }

# nodes = publish.single(args.MQTT_TOPIC_RESPONSE, str(result), hostname=args.MQTT_HOST, port=int(args.MQTT_PORT))
###############################################
