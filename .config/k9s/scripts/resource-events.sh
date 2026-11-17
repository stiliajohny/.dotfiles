#!/bin/sh

set -eu

name=${1:-}
namespace=${2:-}
context=${3:-}

if [ -z "$name" ] || [ -z "$context" ]; then
  printf 'K9s did not provide resource name and context.\n' >&2
  exit 1
fi

if [ -n "$namespace" ] && [ "$namespace" != "-" ] && [ "$namespace" != "all" ]; then
  kubectl get events \
    --field-selector "involvedObject.name=$name" \
    --sort-by='.lastTimestamp' \
    --namespace "$namespace" --context "$context" |
    less -R
else
  kubectl get events \
    --field-selector "involvedObject.name=$name" \
    --sort-by='.lastTimestamp' \
    --all-namespaces --context "$context" |
    less -R
fi
