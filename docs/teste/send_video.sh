gst-launch-1.0  filesrc location=/vol1/out.mp4 \
    ! tee name=t \
    ! queue \
    ! decodebin \
    ! videobalance saturation= 0 \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=10.0.0.252 port=5000 \
    t. \
    ! queue \
    ! decodebin \
    ! videobalance saturation=0 \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=10.0.0.253 port=5000 \
    t. \
    ! queue \
    ! decodebin \
    ! videobalance saturation=0 \
    ! x264enc \
    ! rtph264pay \
    ! udpsink host=10.0.0.254 port=5000

# gst-launch-1.0 filesrc location=./out.mp4     ! decodebin     ! videobalance saturation=0     ! videoscale     ! video/x-raw,framerate=5/1, width=200,height=200     ! x264enc     ! rtph264pay     ! udpsink host=10.0.0.252 port=5000

