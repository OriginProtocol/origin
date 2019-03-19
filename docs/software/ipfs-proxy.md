---
layout: page
title: IPFS Proxy
category: Software
---

The Origin IPFS proxy is a layer between Origin's IPFS servers and the outside world. It is responsible for validating requests and ensuring no malicious content is being served from Origin's IPFS servers.

It restricts the content that is stored/retrieved on IPFS to images and JSON files. It also restricts the size of files that are being uploaded.

It is intended to be transparent. It is not a required part of the Origin component stack, and a bare IPFS server can integrate with Origin without an issue.
