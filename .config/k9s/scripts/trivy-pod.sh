#!/bin/sh

set -eu

pod=${1:-}
namespace=${2:-}
context=${3:-}

if [ -z "$pod" ] || [ -z "$namespace" ] || [ -z "$context" ]; then
  printf 'K9s did not provide pod, namespace and context.\n' >&2
  exit 1
fi

for dependency in kubectl trivy; do
  if ! command -v "$dependency" >/dev/null 2>&1; then
    printf '%s is required for this plugin.\n' "$dependency" >&2
    exit 1
  fi
done

images=$(kubectl get pod "$pod" \
  --namespace "$namespace" \
  --context "$context" \
  -o jsonpath='{range .spec.initContainers[*]}{.image}{"\n"}{end}{range .spec.containers[*]}{.image}{"\n"}{end}' |
  awk 'NF && !seen[$0]++')

if [ -z "$images" ]; then
  printf 'No images found for pod %s.\n' "$pod" >&2
  exit 1
fi

image_count=$(printf '%s\n' "$images" | awk 'END { print NR }')
if [ "$image_count" -eq 1 ]; then
  selected=$images
elif command -v fzf >/dev/null 2>&1; then
  selected=$(printf '%s\n' "$images" | fzf \
    --height=70% \
    --layout=reverse \
    --border=rounded \
    --prompt='image to scan > ' \
    --header="$namespace/$pod  •  Enter scan  •  Esc cancel") || exit 0
else
  printf 'This pod has multiple images and fzf is not installed:\n%s\n' "$images" >&2
  exit 1
fi

printf '\nScanning %s\n\n' "$selected"
trivy image \
  --scanners vuln \
  --severity HIGH,CRITICAL \
  --ignore-unfixed \
  "$selected"

printf '\nPress Enter to return to K9s. '
read -r _ || true
