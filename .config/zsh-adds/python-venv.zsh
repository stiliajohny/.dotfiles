#!/usr/bin/env zsh
#
# Helpers for `python3 -m venv` (Homebrew / PEP 668: use venvs, not global pip).

: "${PYTHON_SKEL:=$HOME/Templates/python-skel}"

# Create `.venv` in the current directory and refresh pip tooling.
# Usage: mkvenv [python_executable]
mkvenv() {
  local py="${1:-python3}"

  command -v "$py" >/dev/null || {
    echo "mkvenv: not found: $py" >&2
    return 1
  }
  if [[ -d .venv ]]; then
    echo "mkvenv: .venv already exists" >&2
    return 1
  fi
  "$py" -m venv .venv || return 1
  ./.venv/bin/python -m pip install -U pip setuptools wheel packaging || return 1
}

# Source `.venv/bin/activate` when present.
vact() {
  [[ -f .venv/bin/activate ]] || {
    echo "vact: no .venv/bin/activate here" >&2
    return 1
  }
  source .venv/bin/activate
}

# Run a command with the project venv's Python (no activate required).
# Usage: vrun script.py [args...]
vrun() {
  [[ -x .venv/bin/python ]] || {
    echo "vrun: no .venv/bin/python" >&2
    return 1
  }
  .venv/bin/python "$@"
}

# Copy the template into a new directory, cd there, and run mkvenv.
# Set PYTHON_SKEL to override the skel path.
# Usage: pynew <directory_name>
pynew() {
  local name="$1" skel="$PYTHON_SKEL"

  [[ -n "$name" ]] || {
    echo "usage: pynew <dirname>" >&2
    return 1
  }
  [[ -d "$skel" ]] || {
    echo "pynew: template missing: $skel" >&2
    return 1
  }
  [[ -e "$name" ]] && {
    echo "pynew: $name already exists" >&2
    return 1
  }
  cp -R "$skel" "$name" || return 1
  cd "$name" || return 1
  mkvenv
}
