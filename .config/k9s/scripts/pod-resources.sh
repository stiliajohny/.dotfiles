#!/bin/sh

set -eu

pod=${1:-}
namespace=${2:-}
context=${3:-}

if [ -z "$pod" ] || [ -z "$namespace" ] || [ -z "$context" ]; then
  printf 'K9s did not provide pod, namespace and context.\n' >&2
  exit 1
fi

kubectl get pod "$pod" --namespace "$namespace" --context "$context" -o json |
  jq '{
    pod: .metadata.name,
    namespace: .metadata.namespace,
    phase: .status.phase,
    qosClass: .status.qosClass,
    initContainers: [(.spec.initContainers // [])[] | {
      name,
      requests: (.resources.requests // {}),
      limits: (.resources.limits // {})
    }],
    containers: [.spec.containers[] | {
      name,
      requests: (.resources.requests // {}),
      limits: (.resources.limits // {})
    }]
  }' | less -R
