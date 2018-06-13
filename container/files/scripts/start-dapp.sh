cd /opt/origin-dapp/source

# update symlink to origin
rm /usr/lib/node_modules/origin
ln -s /opt/origin-js/source /usr/lib/node_modules/origin

cp -r /opt/origin-dapp/node_modules node_modules
npm start
