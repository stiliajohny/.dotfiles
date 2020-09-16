# Setup fzf
# ---------
if [[ ! "$PATH" == */home/jstilia/.config/oh-my-zsh/fzf/bin* ]]; then
  export PATH="${PATH:+${PATH}:}/home/jstilia/.config/oh-my-zsh/fzf/bin"
fi

# Auto-completion
# ---------------
[[ $- == *i* ]] && source "/home/jstilia/.config/oh-my-zsh/fzf/shell/completion.bash" 2> /dev/null

# Key bindings
# ------------
source "/home/jstilia/.config/oh-my-zsh/fzf/shell/key-bindings.bash"
