How to send gstreamer data via UDP and consume it at  VLC

# Sender

gst-launch-1.0  videotestsrc pattern=ball \
    ! tee name=t \
    ! queue \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=localhost port=50000

# SDP file

v=0
c=IN IP4 127.0.0.1
m=video 50000 RTP/AVP 96
a=rtpmap:96 H264/90000
a=fmtp:96 media=video; clock-rate=90000; encoding-name=H264; sprop-parameter-sets=Z2QAFKzZQUH7AWoMAgtKAAADAAIAAAMAeR4oUyw\=\,aOvssiw\=

to run it in VLC 

cvlc -v ./vlc_example.sdp

IMPORTANT NOTE: vlc if forbiden in linux to access some low ports, like 5000, well in my setup it was blocked, so you need to use a higher port

# SPROP-PARAMETER-SETS

to get the sprop-parameter-sets you needed to run gst-launch-1.0 .... -v and get the info from result string, in my case the value was

/GstPipeline:pipeline0/GstUDPSink:udpsink0.GstPad:sink: caps = application/x-rtp, media=(string)video, clock-rate=(int)90000, encoding-name=(string)H264, packetization-mode=(string)1, profile-level-id=(string)640014, sprop-parameter-sets=(string)"Z2QAFKzZQUH7AWoMAgtKAAADAAIAAAMAeR4oUyw\=\,aOvssiw\=", payload=(int)96, ssrc=(uint)2292477499, timestamp-offset=(uint)3631216397, seqnum-offset=(uint)26151, a-framerate=(string)30
