
# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/Users/johnstilia/miniconda/bin/conda' 'shell.bash' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/Users/johnstilia/miniconda/etc/profile.d/conda.sh" ]; then
        . "/Users/johnstilia/miniconda/etc/profile.d/conda.sh"
    else
        export PATH="/Users/johnstilia/miniconda/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<


# uv / python user env (only if present — missing file breaks login shells / SwiftBar)
if [[ -f "$HOME/.local/bin/env" ]]; then
  # shellcheck disable=SC1091
  . "$HOME/.local/bin/env"
fi

# Added by LM Studio CLI tool (lms)
export PATH="$PATH:/Users/johnstilia/.lmstudio/bin"

# Added by PAI installer — make bun reachable for hook subprocesses
export PATH="$HOME/.bun/bin:$PATH"
. "$HOME/.cargo/env"
