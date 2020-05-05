mkdir -p alfa
cd alfa

DIR=".git"
if [ -d "$DIR" ]; then
    echo "Installing git"
    git init
    git remote add origin -f git@github.com:midiacom/alfa.git  
    git config core.sparseCheckout true # enable this
fi

echo "/alfa/src/rtsp_to_udp" >> .git/info/sparse-checkout
