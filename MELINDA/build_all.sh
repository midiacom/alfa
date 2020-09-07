cd vms_mlo
docker build . -t alfa/vms/melinda/mlo/qrcodedetect

cd ../vms_dlo
docker build . -t alfa/vms/melinda/dlo/pubtext

cd ../vms_flo
docker build . -t alfa/vms/melinda/flo/qrcodeextract

cd ..
docker build . -t alfa/component/image_broker