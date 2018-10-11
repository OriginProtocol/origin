#!/bin/bash
kubectl config set-context $(kubectl config current-context) --namespace=$1
