# Clone js source
git clone https://github.com/OriginProtocol/origin-js.git js

cd js

# Checkout js develop branch
git checkout develop

# Install node modules
# npm run install:dev

cd ..

# Build js image
docker build ./containers/js-container -t origin-js-image
