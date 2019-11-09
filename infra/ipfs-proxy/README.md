![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

# origin-ipfs-proxy

The Origin IPFS proxy is a layer between Origin's IPFS servers and the outside world. It is responsible for validating requests and ensuring no malicious content is being served from Origin's IPFS servers. The proxy restricts the content that is stored/retrieved on IPFS to images and JSON files. It also restricts the size of files that are being uploaded.

This directory contains a node server that sites in front of Origin's IPFS nodes to validate files being uploaded and downloaded. It allows the following filetypes:

- png
- gif
- jpeg
- json

## Running origin-ipfs-proxy

`npm run start`

## Running tests

`npm run test`

For some load testing and benchmarking of origin-ipfs-proxy vs a bare IPFS node run:

`npm run test:load`
