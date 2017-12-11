yarn run build:dev
scp -r build/ indraneel@107.170.5.17:~/pavement-sms
yarn run build
cp -r build/ ~/Code/pavement/teampavement.github.io/
cd ~/Code/pavement/teampavement.github.io/
git commit -am "$1"
git push origin master
