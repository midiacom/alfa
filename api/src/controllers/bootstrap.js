const deviceModel = require("../models/deviceModel")
const locationModel = require("../models/locationModel")
const vmsTypeModel = require("../models/vmsTypeModel")

const docker = require("../util/dockerApi")

const bootstrapController = {
    boot: async (req, res, next) => {

        // create the location 
        let loc = await new locationModel({
            name: "Office #1"
        }).save();
        
        // create the SRCs Types
        const vmsTypeSrc0 = await new vmsTypeModel({
            name: 'SRC = USB Camera #1',
            dockerImage: 'alfa/src/camera_usb',
            startupParameters: "DEVICE_PATH | Example /dev/video0",
            description: 'This will get the video from usb and send via UDP to the VMS',
            src: 1,
            sdp: '',
        }).save();
        
        const vmsTypeSrc1 = await new vmsTypeModel({
            name: 'SRC = RTSP to UDP Video #1',
            dockerImage: 'alfa/src/rtsp_to_udp',
            startupParameters: "RSTP_SOURCE | Example rtsp://192.168.0.102:8080/h264_ulaw.sdp",
            description: 'This will get the video from as RTSP server and send via UDP to the VMS',
            src: 1,
            sdp: '',
        }).save();

        const vmsTypeSrc2 = await new vmsTypeModel({
            name: 'SRC = Video Sample #1',
            dockerImage: 'alfa/src/video_sample',
            startupParameters: "VIDEO_PATTERN | Example (int number [0-24]",
            description: 'This is a simple video sample test',
            src: 1,
            sdp: '',
        }).save();

        const vmsTypeSrc3 = await new vmsTypeModel({
            name: 'SRC = Audio Sample #1',
            dockerImage: 'alfa/src/audio_sample',
            startupParameters: "",
            description: 'This is a simple audio sample test',
            src: 1,
            sdp: '',
        }).save();

        const vmsTypeSrc3 = await new vmsTypeModel({
            name: 'SRC = Mic Local Device #1',
            dockerImage: 'alfa/src/mic_device',
            startupParameters: "",
            description: 'This is get the audio from a local mic',
            src: 1,
            sdp: '',
        }).save();

        // Create the VMS types
        const vmsTypeVms0 = await new vmsTypeModel({
            name: 'VMS = Forward UDP to UDP changing video to greyscale',
            dockerImage: 'alfa/plugin/udp_video_black_white',
            startupParameters: "HOST_IP PORT | Ex:172.17.0.1 10001",
            description: 'This will get a UDP video stream and send it in greyscale',
            src: 0,
            sdp: '',
        }).save();

        const vmsTypeVms1 = await new vmsTypeModel({
            name: 'VMS = Forward UDP to UDP cropping the video',
            dockerImage: 'alfa/plugin/udp_video_crop',
            startupParameters: "TOP LEFT RIGHT BOTTOM IP PORT | Example 100 100 100 100 172.17.0.1 10001",
            description: 'This plugin grabs a video and cut it ',
            src: 0,
            sdp: '',
        }).save();

        const vmsTypeVms2 = await new vmsTypeModel({
            name: 'VMS = UDP to UDP',
            dockerImage: 'alfa/plugin/udp_to_udp',
            startupParameters: "IP PORT | Example 172.17.0.1 10001",
            description: 'This plugin will Forward UDP package',
            src: 0,
            sdp: '',
        }).save();

        // create the devices
        const device0 = await new deviceModel({
            name: 'Video Sample Ball #1',
            connectionType: 'alfa/src/video_sample',
            physicalPath: '',
            connectionParameters: '18',
            description: '',
            location: loc._id
        }).save();

        const device1 = await new deviceModel({
            name: 'Video Sample Color Bars #1',
            connectionType: 'alfa/src/video_sample',
            physicalPath: '',
            connectionParameters: '13',
            description: '',
            location: loc._id
        }).save();

        const device2 = await new deviceModel({
            name: 'Audio Sample #1',
            connectionType: 'alfa/src/audio_sample',
            physicalPath: '',
            connectionParameters: '',
            description: '',
            location: loc._id
        }).save();

        const device3 = await new deviceModel({
            name: 'Webcan of Notebook - USB Device #1',
            connectionType: 'alfa/src/camera_usb',
            physicalPath: '/dev/video0',
            connectionParameters: '/dev/video0',
            description: '',
            location: loc._id
        }).save();

        const device4 = await new deviceModel({
            name: 'Phone- RTSP #1',
            connectionType: 'alfa/src/rtsp_to_udp',
            physicalPath: '',
            connectionParameters: 'rtsp://192.168.0.102:8080/h264_ulaw.sdp',
            description: '',
            location: loc._id
        }).save();

        const device4 = await new deviceModel({
            name: 'Local Mic hw:0 #1',
            connectionType: 'alfa/src/mic_device',
            physicalPath: '',
            connectionParameters: 'hw:0',
            description: '',
            location: loc._id
        }).save();
        
        return res.status(201).json("{ok:ok}");
    }
}    
module.exports = bootstrapController