python3 qcode.py

python3 merge.py

ffmpeg -r 1/5 -pattern_type glob -i './video/*.png' -c:v libx264 -vf fps=25 -pix_fmt yuv420p out.mp4