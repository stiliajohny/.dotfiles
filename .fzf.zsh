# Setup fzf
# ---------
if [[ ! "$PATH" == */home/jstilia/Documents/GitHub/fzf/bin* ]]; then
  export PATH="${PATH:+${PATH}:}/home/jstilia/Documents/GitHub/fzf/bin"
fi

# Auto-completion
# ---------------
[[ $- == *i* ]] && source "/home/jstilia/Documents/GitHub/fzf/shell/completion.zsh" 2> /dev/null

# Key bindings
# ------------
source "/home/jstilia/Documents/GitHub/fzf/shell/key-bindings.zsh"
