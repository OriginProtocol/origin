# Temporary Deployments

## busybox

## origin-scripts

The `origin-scripts` kubernetes deployment is good for running one-off scripts.
It includes a good portion of the source tree and doesn't run anything.

### Usage

    kubectl create -f devops/kubernetes/misc/origin-scripts.yaml
    kubectl exec -it origin-scripts -c origin-scripts /bin/bash
    # when complete
    kubectl delete pod origin-scripts
