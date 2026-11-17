#!/bin/sh

set -eu

pod=${1:-}
namespace=${2:-}
context=${3:-}

if [ -z "$pod" ] || [ -z "$namespace" ] || [ -z "$context" ]; then
  printf 'K9s did not provide pod, namespace and context.\n' >&2
  exit 1
fi

{
  printf '===== CURRENT LOGS =====\n\n'
  kubectl logs "$pod" --all-containers=true --tail=1000 \
    --namespace "$namespace" --context "$context" 2>&1 || true
  printf '\n===== PREVIOUS LOGS =====\n\n'
  kubectl logs "$pod" --all-containers=true --previous --tail=1000 \
    --namespace "$namespace" --context "$context" 2>&1 || true
} | less -R
