const deviceModel = require("../models/deviceModel")
const locationModel = require("../models/locationModel")
const vmsTypeModel = require("../models/vmsTypeModel")
const nodeModel = require("../models/nodeModel")

const docker = require("../util/dockerApi")

const bootstrapController = {
    boot: async (req, res, next) => {

        // create the location 
        let loc = await new locationModel({
            name: "Office #1"
        }).save();
        
        const edgeNodeLocal = await new nodeModel({
                name: 'Local Master Node',
                ip: 'localhost',
                isMaster: true,
                description: 'Local Master Node'
        }).save()

        // create the Virtual Device Types
        const vmsTypeSrc0 = await new vmsTypeModel({
            name: 'Virtual Device = USB Camera #1',
            dockerImage: 'alfa/device/camera_usb',
            startupParameters: "DEVICE_PATH | Example /dev/video0",
            description: 'This will get the video from usb and send via UDP to the VMS',
            src: 1,
            sdp: '',
            outputType: 'video'
        }).save();
        
        const vmsTypeSrc1 = await new vmsTypeModel({
            name: 'Virtual Device = RTSP to UDP Video #1',
            dockerImage: 'alfa/device/rtsp_to_udp',
            startupParameters: "RSTP_SOURCE | Example rtsp://192.168.0.102:8080/h264_ulaw.sdp",
            description: 'This will get the video from as RTSP server and send via UDP to the VMS',
            src: 1,
            sdp: '',
            outputType: 'video'
        }).save();

        const vmsTypeSrc2 = await new vmsTypeModel({
            name: 'Virtual Device = Video Sample #1',
            dockerImage: 'alfa/device/video_sample',
            startupParameters: "VIDEO_PATTERN | Example (int number [0-24]",
            description: 'This is a simple video sample test',
            src: 1,
            sdp: '',
            outputType: 'video'
        }).save();

        const vmsTypeSrc3 = await new vmsTypeModel({
            name: 'Virtual Device = Audio Sample #1',
            dockerImage: 'alfa/device/audio_sample',
            startupParameters: "",
            description: 'This is a simple audio sample test',
            src: 1,
            sdp: '',
            outputType: 'audio'
        }).save();

        const vmsTypeSrc4 = await new vmsTypeModel({
            name: 'Virtual Device = Mic Local Device #1',
            dockerImage: 'alfa/device/mic_device',
            startupParameters: "",
            description: 'This is get the audio from a local mic',
            src: 1,
            sdp: '',
            outputType: 'audio'
        }).save();

        // Create the VMS types
        const vmsTypeVms0 = await new vmsTypeModel({
            name: 'VMS = Forward UDP to UDP changing video to greyscale',
            dockerImage: 'alfa/vms/udp_video_black_white',
            startupParameters: "HOST_IP PORT | Ex:172.17.0.1 10001",
            description: 'This will get a UDP video stream and send it in greyscale',
            src: 0,
            sdp: '',
            ports: '5000'
        }).save();

        const vmsTypeVms1 = await new vmsTypeModel({
            name: 'VMS = Forward UDP to UDP cropping the video',
            dockerImage: 'alfa/vms/udp_video_crop',
            startupParameters: "TOP LEFT RIGHT BOTTOM IP PORT | Example 100 100 100 100 172.17.0.1 10001",
            description: 'This plugin grabs a video and cut it ',
            src: 0,
            sdp: '',
            ports: '5000'
        }).save();

        const vmsTypeVms2 = await new vmsTypeModel({
            name: 'VMS = UDP to UDP',
            dockerImage: 'alfa/vms/udp_to_udp',
            startupParameters: "IP PORT | Example 172.17.0.1 10001",
            description: 'This plugin will Forward UDP package',
            src: 0,
            sdp: '',
            ports: '5000'
        }).save();

        const vmsTypeVms3 = await new vmsTypeModel({
            name: 'VMS = Noise Detector',
            dockerImage: 'alfa/vms/noise_detector',
            startupParameters: "SENSITIVENESS TOPIC MQTT_SERVER MQTT_PORT | Example 0.02 topic_alert 172.17.0.1 1883",
            description: 'This send to a MQTT server the noise captured',
            src: 0,
            sdp: '',
            ports: '5000'
        }).save();

        const vmsTypeVms4 = await new vmsTypeModel({
            name: 'VMS = Video Merge',
            dockerImage: 'alfa/vms/video_merge',
            startupParameters: "IP PORT | Example 172.17.0.1 10001",
            description: 'Merge two UDP videos and send it via UDP',
            src: 0,
            sdp: '',
            ports: '15000;15001'
        }).save();
        
        const vmsTypeVms5 = await new vmsTypeModel({
            name: 'VMS = Video Face Counter',
            dockerImage: 'alfa/vms/face_counter',
            startupParameters: "TOPIC IP PORT | Example ABC 172.17.0.1 1883",
            description: 'Count how many faces are in a video stream and send the value to a MQTT server',
            src: 0,
            sdp: '',
            ports: '5000'
        }).save();

        const vmsTypeVms6 = await new vmsTypeModel({
            name: 'VMS = UDP Flex',
            dockerImage: 'alfa/vms/udp_flex',
            startupParameters: "IP PORT SEC| Example 172.17.0.1 10001 20",
            description: 'Use this VMS between two VMS to get network statistics about the stream (172.17.0.1;10020;01ac7153;A) o tópíco tem que ser igual ao id da msg pra add o fluxo de saída',
            src: 0,
            sdp: '',
            ports: '5000'
        }).save();
        
        const vmsTypeVms7 = await new vmsTypeModel({
            name: 'VMS = Video QR Code Detection',
            dockerImage: 'alfa/vms/video_qrcode_detection',
            startupParameters: "IP PORT SEC| Example 172.17.0.1 10001 20",
            description: 'Use this VMS to detect QRCodes in video (IN DEVELOPMENT YET)', 
            src: 0,
            sdp: '',
            ports: '5000'
        }).save();
        
        // create the devices
        const device0 = await new deviceModel({
            name: 'Video Sample Ball #1',
            connectionType: 'alfa/device/video_sample',
            physicalPath: '',
            connectionParameters: '18',
            description: '',
            location: loc._id,
            node: edgeNodeLocal._id
        }).save();

        const device1 = await new deviceModel({
            name: 'Video Sample Color Bars #1',
            connectionType: 'alfa/device/video_sample',
            physicalPath: '',
            connectionParameters: '13',
            description: '',
            location: loc._id,
            node: edgeNodeLocal._id
        }).save();

        const device2 = await new deviceModel({
            name: 'Audio Sample #1',
            connectionType: 'alfa/device/audio_sample',
            physicalPath: '',
            connectionParameters: '',
            description: '',
            location: loc._id,
            node: edgeNodeLocal._id
        }).save();

        const device3 = await new deviceModel({
            name: 'Webcan of Notebook - USB Device #1',
            connectionType: 'alfa/device/camera_usb',
            physicalPath: '/dev/video0',
            connectionParameters: '/dev/video0',
            description: '',
            location: loc._id,
            node: edgeNodeLocal._id
        }).save();

        const device4 = await new deviceModel({
            name: 'Phone- RTSP #1',
            connectionType: 'alfa/device/rtsp_to_udp',
            physicalPath: '',
            connectionParameters: 'rtsp://192.168.0.102:8080/h264_ulaw.sdp',
            description: '',
            location: loc._id,
            node: edgeNodeLocal._id
        }).save();

        const device5 = await new deviceModel({
            name: 'Local Mic hw:0 #1',
            connectionType: 'alfa/device/mic_device',
            physicalPath: '/dev/snd',
            connectionParameters: 'hw:0',
            description: '',
            location: loc._id,
            node: edgeNodeLocal._id
        }).save();
        
        return res.status(201).json("{ok:ok}");
    }
}    
module.exports = bootstrapController