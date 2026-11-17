#!/bin/sh

set -eu

cluster=${1:-}
context=${2:-}
requested_skin=${3:-}

if [ -z "$cluster" ] || [ -z "$context" ]; then
  printf 'K9s did not provide the active cluster and context.\n' >&2
  exit 1
fi

config_home=${XDG_CONFIG_HOME:-${HOME}/.config}
data_home=${XDG_DATA_HOME:-${HOME}/.local/share}
skins_dir="$config_home/k9s/skins"
context_config="$data_home/k9s/clusters/$cluster/$context/config.yaml"

if [ ! -d "$skins_dir" ]; then
  printf 'Skin directory not found: %s\n' "$skins_dir" >&2
  exit 1
fi

if [ ! -f "$context_config" ]; then
  printf 'Context config not found: %s\nOpen this context once in K9s, then retry.\n' "$context_config" >&2
  exit 1
fi

configured_skin=$(awk '/^[[:space:]]+skin:[[:space:]]*/ { print $2; exit }' "$context_config")
case $configured_skin in
  cluster-*) ;;
  *)
    printf 'This context is not using a managed cluster skin: %s\n' "${configured_skin:-none}" >&2
    printf 'Assign a cluster-* skin in %s and restart K9s once.\n' "$context_config" >&2
    exit 1
    ;;
esac

managed_skin="$skins_dir/$configured_skin.yaml"
preset_state="$data_home/k9s/clusters/$cluster/$context/skin-preset"
current_skin=$(sed -n '1p' "$preset_state" 2>/dev/null || true)

if [ -n "$requested_skin" ]; then
  selected=$requested_skin
else
  if ! command -v fzf >/dev/null 2>&1; then
    printf 'fzf is required for the skin picker.\n' >&2
    exit 1
  fi

  choices=$(
    {
      printf 'red\tred · remote / caution\n'
      printf 'kanagawa\tkanagawa · green and gold\n'
      printf 'dracula\tdracula · purple\n'
      printf 'nightfox\tnightfox · blue\n'
      printf 'nord\tnord · cool blue\n'
      find "$skins_dir" -maxdepth 1 -type f -name '*.yaml' ! -name 'cluster-*.yaml' -exec basename {} .yaml \; |
        sort | awk '{ print $0 "\t" $0 }'
    } | awk -F '\t' '!seen[$1]++'
  )

  selected=$(printf '%s\n' "$choices" | fzf \
    --height=80% \
    --layout=reverse \
    --border=rounded \
    --delimiter='\t' \
    --with-nth=2 \
    --prompt="$context colour > " \
    --header="Current: ${current_skin:-global default}  •  Enter apply  •  Esc cancel" |
    awk -F '\t' '{ print $1 }') || exit 0
fi

source_skin="$skins_dir/$selected.yaml"
if [ ! -f "$source_skin" ]; then
  printf 'Unknown skin: %s\n' "$selected" >&2
  exit 1
fi

temporary=$(mktemp "${TMPDIR:-/tmp}/k9s-skin.XXXXXX")
trap 'rm -f "$temporary"' EXIT HUP INT TERM
cp "$source_skin" "$temporary"
chmod 644 "$temporary"
mv "$temporary" "$managed_skin"
printf '%s\n' "$selected" > "$preset_state"
trap - EXIT HUP INT TERM

printf '\n%s now uses the %s skin.\n' "$context" "$selected"
printf 'K9s should repaint the managed skin immediately.\n'
printf 'Press Enter to return to K9s. '
read -r _ || true
