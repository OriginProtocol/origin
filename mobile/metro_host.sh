#!/bin/bash
host_ip=`ipconfig getifaddr en0`
react-native start --host "$host_ip" --reset-cache
