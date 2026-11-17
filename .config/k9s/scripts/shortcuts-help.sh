#!/bin/sh

set -eu

config_home=${XDG_CONFIG_HOME:-${HOME}/.config}
k9s_dir="$config_home/k9s"

entries=$(
  awk '
    /^[[:space:]]+shortCut:[[:space:]]+/ {
      key = $0
      sub(/^[[:space:]]+shortCut:[[:space:]]+/, "", key)
      next
    }
    /^[[:space:]]+description:[[:space:]]+/ && key != "" {
      description = $0
      sub(/^[[:space:]]+description:[[:space:]]+/, "", description)
      printf "%-9s  %s\n", key, description
      key = ""
    }
  ' "$k9s_dir/hotkeys.yaml" "$k9s_dir/plugins.yaml"
)

if [ -z "$entries" ]; then
  printf 'No custom K9s shortcuts were found.\n' >&2
  exit 1
fi

if command -v fzf >/dev/null 2>&1; then
  printf '%s\n' "$entries" | fzf \
    --height=90% \
    --layout=reverse \
    --border=rounded \
    --no-sort \
    --prompt='filter shortcuts > ' \
    --header='Custom K9s keys  •  type to filter  •  ↑/↓ scroll  •  Esc close' \
    >/dev/null || true
else
  {
    printf 'CUSTOM K9S SHORTCUTS\n\n'
    printf '%s\n' "$entries"
  } | less -R
fi
