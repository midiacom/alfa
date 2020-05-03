import sys
import traceback
import argparse

import gi
gi.require_version('Gst', '1.0')
from gi.repository import Gst, GObject  # noqa:F401,F402


# Initializes Gstreamer, it's variables, paths
Gst.init(sys.argv)

DEFAULT_PIPELINE = 'videotestsrc num-buffers=10000 '\
    '! decodebin'\
    '! videoscale'\
    '! video/x-raw,width=800,height=600'\
    '! x264enc'\
    '! rtph264pay'\
    '! udpsink port=10002 host=172.17.0.1'

ap = argparse.ArgumentParser()

ap.add_argument("-p", "--pipeline", required=False,
                default=DEFAULT_PIPELINE, help="Gstreamer pipeline without gst-launch")

args = vars(ap.parse_args())

def on_message(bus: Gst.Bus, message: Gst.Message, loop: GObject.MainLoop):
    mtype = message.type
    if mtype == Gst.MessageType.EOS:
        print("End of stream")
        loop.quit()

    elif mtype == Gst.MessageType.ERROR:
        err, debug = message.parse_error()
        print(err, debug)
        loop.quit()

    elif mtype == Gst.MessageType.WARNING:
        err, debug = message.parse_warning()
        print(err, debug)

    return True


command = args["pipeline"]

pipeline = Gst.parse_launch(command)

Gst.debug_bin_to_dot_file(pipeline,Gst.DebugGraphDetails(-1),'/tmp/teste.dot')

bus = pipeline.get_bus()
bus.add_signal_watch()
pipeline.set_state(Gst.State.PLAYING)
loop = GObject.MainLoop()

bus.connect("message", on_message, loop)

try:
    loop.run()
except Exception:
    traceback.print_exc()
    loop.quit()

# Stop Pipeline
pipeline.set_state(Gst.State.NULL)