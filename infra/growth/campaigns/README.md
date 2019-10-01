
### Twitter and URL shortening
Twitter prepends 'http://' if it identifies a text as URL. It may result in a different content than expected (which will result in a different content hash). So always prepend URLs with `http://` in rule configs.
