# Start truffle develop, run migrate in the console, and prevent Docker from stopping the process.
sleep infinity | (echo migrate && cat) | truffle develop
