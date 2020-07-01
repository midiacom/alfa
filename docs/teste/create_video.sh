python3 qcode.py

python3 merge.py

ffmpeg -r 1/2 -pattern_type glob -i './video/*.png' -s 200x200 -sws_flags neighbor -c:v libx264 -vf fps=5 -pix_fmt yuv420p out.mp4