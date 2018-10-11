#!/bin/bash

# This script will bootstrap a Origin Kubernetes cluster configuration with
# a development, staging, and production namespace

# Install Tiller
kubectl create serviceaccount --namespace kube-system tiller
kubectl create clusterrolebinding tiller-cluster-rule \
	--clusterrole=cluster-admin \
	--serviceaccount=kube-system:tiller
helm init --service-account tiller --upgrade
kubectl patch deploy \
	--namespace kube-system tiller-deploy \
	-p '{"spec":{"template":{"spec":{"serviceAccount":"tiller"}}}}'

# Configure cluster namespaces
kubectl create -f misc/namespaces.yaml

sleep 10

# TODO try and do this via requirements.yaml for the Origin chart

# Install cert-manager for issuing SSL certificates through LetsEncrypt
helm install stable/cert-manager --name cert-manager \
	--namespace kube-system	\
	--set rbac.create=true \
	--set ingressShim.defaultIssuerName=letsencrypt-prod \
	--set ingressShim.defaultIssuerKind=ClusterIssuer

# The nginx-ingress controllers need separate names because helm requires
# globally unique names and not unique names within the namespace
# See https://github.com/helm/helm/issues/2060

# Note that SSL chain completion is disabled to prevent frequently reloading
# of nginx-ingress when missing intermediate CA certificates are updated
# which was resulting in dropped websocket connections for the messaging
# server

# Install nginx ingress for development
helm install stable/nginx-ingress --name dev-ingress \
	--namespace dev \
	--set rbac.create=true \
	--set controller.service.loadBalancerIP="35.233.140.121" \
	--set-string controller.extraArgs.enable-ssl-chain-completion=false

# Install nginx ingress for staging
helm install stable/nginx-ingress --name staging-ingress \
	--namespace staging \
	--set rbac.create=true \
	--set controller.service.loadBalancerIP="35.197.88.39" \
	--set-string controller.extraArgs.enable-ssl-chain-completion=false

# Install nginx ingress for production
helm install stable/nginx-ingress --name prod-ingress \
	--namespace prod \
	--set rbac.create=true \
	--set controller.service.loadBalancerIP="35.203.166.86" \
	--set-string controller.extraArgs.enable-ssl-chain-completion=false

kubectl create -f misc/letsencrypt-staging.yaml
kubectl create -f misc/letsencrypt-prod.yaml
kubectl create -f misc/snapshot-cronjob.yaml -n kube-system
kubectl create -f misc/ssd-storageclass.yaml
