# Fig pre block. Keep at the top of this file.
[[ -f "$HOME/.fig/shell/zshrc.pre.zsh" ]] && builtin source "$HOME/.fig/shell/zshrc.pre.zsh"
# ZSH Options

WORDCHARS=${WORDCHARS//\/} # Don't consider certain characters part of the word
PROMPT_EOL_MARK=""         # hide EOL sign ('%')

# Enable completion features
autoload -Uz compinit
compinit -d ~/.cache/zcompdump


# Export environment variables
# PATH settings
export PATH="/opt/homebrew/bin:$PATH"
export PATH="/opt/homebrew/sbin:$PATH"
export PATH="/usr/local/sbin:$PATH"
export PATH="/usr/local/bin:$PATH"
export PATH="$HOME/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"
export PATH="$HOME/.local/sbin:$PATH"
export PATH="$HOME/.cargo/bin::$PATH"
export PATH="$HOME/.krew/bin:$PATH"


export PATH="$HOME/.fig/bin:$PATH"


# Java
export JAVA_HOME=$(/usr/libexec/java_home)
export PATH=$JAVA_HOME/bin:$PATH

# Go
export GOPATH=$HOME/go
export PATH="$GOPATH/bin:$PATH"

# Python
export PYENV_ROOT="/opt/homebrew/opt/pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init --path)"


# XDG Base Directory Specification
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_CACHE_HOME="$HOME/.cache"
export XDG_DATA_HOME="$HOME/.local/share"
export ZSH_CONFIG="$XDG_CONFIG_HOME/zsh"
export ZSH_CACHE="$XDG_CACHE_HOME/zsh"
export ZSH_COMPDUMP="$ZSH_CONFIG/zcomdump"
export SCREENRC="$XDG_CONFIG_HOME"/screen/screenrc
export XINITRC="$XDG_CONFIG_HOME"/X11/xinitrc
export XSERVERRC="$XDG_CONFIG_HOME"/X11/xserverrc

# Ruby
export GEM_HOME=$HOME/.gem
export PATH="$HOME/.gem/ruby/2.7.0/bin:$PATH"
export PATH="$HOME/.gem/ruby/3.0.0/bin:$PATH"
export PATH="$HOME/.gem/bin:$PATH"

# # Poetry
# export PATH="$HOME/.poetry/bin:$PATH"

# Miscellaneous
mkdir -p $ZSH_CACHE
export VIMINIT=":source $XDG_CONFIG_HOME"/vim/vimrc
export COOKIECUTTER_CONFIG="$XDG_CONFIG_HOME/cookiecutterrc"
export PAGER=""
export ZSH="$HOME/.config/oh-my-zsh"
export FZF_BASE=/usr/bin/fzf
export TIMER_FORMAT='[%d]'
export UPDATE_ZSH_DAYS=1
export ZSH_CUSTOM_AUTOUPDATE_QUIET=true
export UPDATE_ZSH_DAYS=13
export FZF_DEFAULT_OPS="--extended"
export EDITOR="vim"


# Magic Enter
# defaults
MAGIC_ENTER_GIT_COMMAND='git status -u .'
MAGIC_ENTER_OTHER_COMMAND='ls -lh .'

#  TMUX Options for zsh tmux plugin
ZSH_TMUX_ITERM2=true

# Plugins
plugins=(
    adb
    alias-finder
    aliases
    ansible
    asdf
    autoupdate
    aws
    brew
    catimg
    colored-man-pages
    colorize
    command-not-found
    common-aliases
    fzf
    gem
    git
    git-auto-fetch
    git-extras
    git-prompt
    gitfast
    github
    gitignore
    helm
    history
    httpie
    kubectl
    lol
    macos
    magic-enter
    mongocli
    nmap
    node
    npm
    nvm
    ohmyzsh-full-autoupdate
    pep8
    pip
    # poetry
    pyenv
    pyenv
    pylint
    python
    safe-paste
    screen
    ssh-agent
    sudo
    systemd
    taskwarrior
    terraform
    terraform
    thefuck
    themes
    themes
    tig
    tig
    timer
    timer
    tmux
    virtualenv
    virtualenv
    virtualenvwrapper
    virtualenvwrapper
    vscode
    web-search
    zsh-256color
    zsh-autosuggestions
    zsh-completions
    zsh-history-substring-search
    zsh-interactive-cd
    zsh-syntax-highlighting
    zsh-wakatime
)

# ZSH_THEME="mh"

# Source files and configurations
[ -f "$ZSH/oh-my-zsh.sh" ] && source $ZSH/oh-my-zsh.sh
[[ $commands[kubectl] ]] && source <(kubectl completion zsh)
[ -f "$XDG_CONFIG_HOME/zsh/aliases.zsh" ] && source $XDG_CONFIG_HOME/zsh/aliases.zsh
[ -f "$XDG_CONFIG_HOME/zsh/completion.zsh" ] && source $XDG_CONFIG_HOME/zsh/completion.zsh
[ -f "$XDG_CONFIG_HOME/zsh/functions.zsh" ] && source $XDG_CONFIG_HOME/zsh/functions.zsh
[ -f "$XDG_CONFIG_HOME/zsh/kube-config.zsh" ] && source  $XDG_CONFIG_HOME/zsh/kube-config.zsh
[ -f "$XDG_CONFIG_HOME/zsh/minikube.zsh" ] && source $XDG_CONFIG_HOME/zsh/minikube.zsh
[ -f "$XDG_CONFIG_HOME/zsh/vagrant.zsh" ] && source  $XDG_CONFIG_HOME/zsh/vagrant.zsh
# [ -f "$XDG_CONFIG_HOME/zsh/poetry.zsh" ] && source  $XDG_CONFIG_HOME/zsh/poetry.zsh
[ -f "$XDG_CONFIG_HOME/zsh/terraform_prompt.zsh" ] && source  $XDG_CONFIG_HOME/zsh/terraform_prompt.zsh
[ -f "$HOME/.asdf/asdf.sh" ] && source "$HOME/.asdf/asdf.sh"
[ -f "/opt/homebrew/opt/kube-ps1/share/kube-ps1.sh" ] && source "/opt/homebrew/opt/kube-ps1/share/kube-ps1.sh"
[ -f  $HOME/.config/zsh/.fzf.zsh ] && source $HOME/.config/zsh/.fzf.zsh # TODO move it to the source section
[ -f ~/.docker/init-zsh.sh ] && source ~/.docker/init-zsh.sh || true


# Plugin Config
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=60'
DISABLE_MAGIC_FUNCTIONS=true
ZSH_POETRY_AUTO_ACTIVATE=0
ZSH_POETRY_AUTO_DEACTIVATE=1
SHOW_AWS_PROMPT=true
ZSH_THEME_AWS_PREFIX="AWS: "

# User configuration

# History Settings
if (( ! EUID )); then
    HISTFILE=$XDG_CONFIG_HOME/zsh/zsh_history
else
    HISTFILE=$XDG_CONFIG_HOME/zsh/zsh_history
fi
SAVEHIST=1000000
HISTSIZE=1200000


# Tmux
if [ -z "$TMUX" ] && [ "$TERM_PROGRAM" != "vscode" ]; then
    tmux attach -t default || tmux new -s default
fi

# KUBECONFIG for multiple clusters

# Set the default kube context if present
DEFAULT_KUBE_CONTEXTS="$HOME/.kube/config"
if test -f "${DEFAULT_KUBE_CONTEXTS}"
then
  export KUBECONFIG="$DEFAULT_KUBE_CONTEXTS"
fi

# Additional contexts should be in ~/.kube/custom-contexts/
CUSTOM_KUBE_CONTEXTS="$HOME/.kube/custom-contexts"
mkdir -p "${CUSTOM_KUBE_CONTEXTS}"

OIFS="$IFS"
IFS=$'\n'
for contextFile in `find "${CUSTOM_KUBE_CONTEXTS}" -type f -name "*.yml"`
do
    export KUBECONFIG="$contextFile:$KUBECONFIG"
done
IFS="$OIFS"


# Pyenv initialization
if command -v pyenv 1>/dev/null 2>&1; then
  eval "$(pyenv init -)"
fi



# Configure completion
zstyle ':completion:*' menu select
zstyle ':completion:*' group-name ''

# Configure colors for ls command (GNU coreutils)
if [[ "$(uname)" != "Darwin" ]]; then
    eval $(dircolors -b)
fi

# End of the organized ZSH config file


## autocomplete
if [[ ! -o interactive ]]; then
    return
fi

compctl -K _jina jina

_jina() {
  local words completions
  read -cA words

  if [ "${#words}" -eq 2 ]; then
    completions="$(jina commands)"
  else
    completions="$(jina completions ${words[2,-2]})"
  fi

  reply=(${(ps:
:)completions})
}

# session-wise fix
ulimit -n 4096
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"

### MANAGED BY RANCHER DESKTOP START (DO NOT EDIT)
export PATH="/Users/johnstilia/.rd/bin:$PATH"
### MANAGED BY RANCHER DESKTOP END (DO NOT EDIT)

# Fig post block. Keep at the bottom of this file.
[[ -f "$HOME/.fig/shell/zshrc.post.zsh" ]] && builtin source "$HOME/.fig/shell/zshrc.post.zsh"


# JINA_CLI_BEGIN

## autocomplete
if [[ ! -o interactive ]]; then
    return
fi

compctl -K _jina jina

_jina() {
  local words completions
  read -cA words

  if [ "${#words}" -eq 2 ]; then
    completions="$(jina commands)"
  else
    completions="$(jina completions ${words[2,-2]})"
  fi

  reply=(${(ps:
:)completions})
}

# session-wise fix
ulimit -n 4096
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

# JINA_CLI_END
















