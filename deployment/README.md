![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

This directory contains the deployment infrastructure for Origin. 

## Environments

The environments are running on a Kubernetes cluster using separate namespaces. The deployment is managed by a [Helm](https://www.helm.sh/) chart. Each service is a separate Docker container. The Docker containers are built and pushed to a container registry (currently [Google Cloud Container Registry](https://cloud.google.com/container-registry/)).

## Working with Origin Deployments

### Installing Google Cloud SDK

Instructions are available [here.](https://cloud.google.com/sdk/docs/quickstarts)

### Installing kubectl

The kubectl tool is the main utility used to interact with the Kubernetes cluster. You can install it with:

`gcloud components install kubectl`
  
You will then need to grab the credentials for the Origin Kubernetes cluster, you can do this by running:

`gcloud container clusters get-credentials origin`
  
Running this will configure `kubectl` so that every subsequent command runs against the Origin cluster.

Because the Origin deployments run in separate namespaces you might find it handy to add the following alias to your `.zshrc` or `.bashrc` file:

`alias kcd='kubectl config set-context $(kubectl config current-context) --namespace '`

You can then use `kcd dev`, `kcd staging`, or `kcd prod` to quicky change namespaces.


### Installing Helm

Helm is a tool used to manage a deployment that consists of many Kubernetes resources rather than interacting with each resource one by one. It consists of a client side tool called `helm` and a server side tool called `tiller`. The cluster already has `tiller` configured and installed.

The instructions for installing Helm are available [here](https://github.com/helm/helm/blob/master/docs/install.md). You can ignore everything from the "Installing Tiller" heading down.

