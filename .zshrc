

# ZSH Options

WORDCHARS=${WORDCHARS//\/} # Don't consider certain characters part of the word
PROMPT_EOL_MARK=""         # hide EOL sign ('%')

# Enable completion features
autoload -Uz compinit
compinit -d ~/.cache/zcompdump

# Set terminal type
if [ -e /usr/share/terminfo/x/xterm-256color ]; then
        export TERM='xterm-256color'
else
        export TERM='xterm-color'
fi

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
export PATH="$HOME/Library/Python/3.9/bin:$PATH"
export PATH="$HOME/.krew/bin:$PATH"
export PATH="$GOPATH/bin:$PATH"
export PATH="$HOME/.gem/ruby/2.7.0/bin:$PATH"
export PATH="$HOME/.gem/ruby/3.0.0/bin:$PATH"
export PATH="$HOME/.gem/bin:$PATH"


# Java
export JAVA_HOME=$(/usr/libexec/java_home)
export PATH=$JAVA_HOME/bin:$PATH

# Go
export GOPATH=$HOME/go

# Python
export PYENV_ROOT="$HOME/.pyenv"
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

# Poetry
export PATH="$HOME/.poetry/bin:$PATH"

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
    poetry
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
[ -f "$XDG_CONFIG_HOME/zsh/poetry.zsh" ] && source  $XDG_CONFIG_HOME/zsh/poetry.zsh
[ -f "$XDG_CONFIG_HOME/zsh/terraform_prompt.zsh" ] && source  $XDG_CONFIG_HOME/zsh/terraform_prompt.zsh
[ -f "$HOME/.asdf/asdf.sh" ] && source "$HOME/.asdf/asdf.sh"
[ -f "/opt/homebrew/opt/kube-ps1/share/kube-ps1.sh" ] && source "/opt/homebrew/opt/kube-ps1/share/kube-ps1.sh"
[ -f  $HOME/.config/zsh/.fzf.zsh ] && source $HOME/.config/zsh/.fzf.zsh # TODO move it to the source section
[ -f ~/.docker/init-zsh.sh ] && source ~/.docker/init-zsh.sh || true


# Plugin Config
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=60'
DISABLE_MAGIC_FUNCTIONS=true
ZSH_POETRY_AUTO_ACTIVATE=1
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





# kube context
kube_context() {
  if [[ -n "$(which kubectl)" ]]; then
    local context="$(kubectl config current-context 2>/dev/null)"
    local namespace="$(kubectl config view --minify --output 'jsonpath={..namespace}' 2>/dev/null)"
    if [[ -n "${context}" ]]; then
      if [[ -z "${namespace}" ]]; then
        namespace="default"
      fi
      echo "${cyan}[${reset}${context}:${namespace}${cyan}]${reset}"
    fi
  fi
}

aws_profile() {
  if [ -z "${AWS_PROFILE}" ]; then
    echo ""
  elif [ -z "$(echo -e "${AWS_PROFILE}" | tr -d '[:space:]')" ]; then
    echo "|AWS: ${yellow}unknown${reset}"
  else
    echo "|AWS: ${yellow}${AWS_PROFILE}${reset}"
  fi
}

terraform_workspace(){
  # if the .terraform folder does exist then we are in a terraform project
  if [[ -d .terraform ]]; then
    # if the workspace is not default then we are in a terraform workspace
    if [[ $(terraform workspace show) != "default" ]]; then
      echo "|${cyan}[${reset}Terraform: ${yellow}$(terraform workspace show)${cyan}]${reset}"
    fi
  fi
}

# Virtual Environment
virtualenv_info() {
    if [[ -n "$VIRTUAL_ENV" ]]; then
        echo "|${cyan}[${reset}Python: ${yellow}$(python --version 2>&1 | cut -d " " -f 2)${reset} - ($(basename $VIRTUAL_ENV))${cyan}]${reset}"
    fi
}

# Custom funky theme

# Set colors
local black="%F{black}"
local red="%F{red}"
local green="%F{green}"
local yellow="%F{yellow}"
local blue="%F{blue}"
local magenta="%F{magenta}"
local cyan="%F{cyan}"
local white="%F{white}"
local reset="%f"

# Prompt elements
local prompt_symbol="${green}➜${reset}"
local current_dir="${yellow}%1~${reset}"
local git_info="${magenta}\$(git_prompt_info)${reset}"
local user_host="${green}%n@%m${reset}"

# Git prompt configuration
ZSH_THEME_GIT_PROMPT_PREFIX="("
ZSH_THEME_GIT_PROMPT_SUFFIX=")"
ZSH_THEME_GIT_PROMPT_DIRTY=" *"
ZSH_THEME_GIT_PROMPT_CLEAN=""
ZSH_THEME_GIT_PROMPT_ADDED="${green}+"
ZSH_THEME_GIT_PROMPT_MODIFIED="${yellow}!"
ZSH_THEME_GIT_PROMPT_DELETED="${red}-"
ZSH_THEME_GIT_PROMPT_UNTRACKED="${cyan}?"
ZSH_THEME_GIT_PROMPT_STASHED="${magenta}⚑"
ZSH_THEME_GIT_PROMPT_AHEAD="${green}⇡"
ZSH_THEME_GIT_PROMPT_BEHIND="${green}⇣"
ZSH_THEME_GIT_PROMPT_DIVERGED="${green}⇕"
ZSH_THEME_RUBY_PROMPT_PREFIX=' using %F{red}'
ZSH_THEME_RUBY_PROMPT_SUFFIX='%f'

# KUBE-PS1 configuration
KUBE_PS1_BINARY="kubectl"
KUBE_PS1_NS_ENABLE=true
KUBE_PS1_PREFIX="("
KUBE_PS1_SYMBOL_ENABLE=true
KUBE_PS1_SYMBOL_PADDING=true
KUBE_PS1_SYMBOL_DEFAULT="⎈ "
KUBE_PS1_SYMBOL_USE_IMG=true
KUBE_PS1_SEPARATOR="|"
KUBE_PS1_DIVIDER=":"
KUBE_PS1_SUFFIX=")"
KUBE_PS1_SEPARATOR=''
# KUBE_PS1_PREFIX_COLOR="${yellow}"
# KUBE_PS1_SYMBOL_COLOR="${magenta}"
# KUBE_PS1_CTX_COLOR="${magenta}"
# KUBE_PS1_SUFFIX_COLOR="${yellow}"
# KUBE_PS1_NS_COLOR="${magenta}"
# KUBE_PS1_BG_COLOR="${magenta}"

# TF-Prompt configuration
ZSH_THEME_TF_PROMPT_PREFIX="%{$fg[white]%}"
ZSH_THEME_TF_PROMPT_SUFFIX="%{$reset_color%}"
#  can use $(tf_prompt_info) as PROMPT entry

# Main prompt
PROMPT_EOL_MARK=""
PROMPT='${user_host} ${current_dir} $(git_prompt_info) ${blue}${reset}
$(kube_ps1)$(aws_profile)$(virtualenv_info)$(terraform_workspace) ${prompt_symbol} %{%}'


# Set up right prompt
RPROMPT="${cyan}%D{%H:%M}${reset}"

# Configure completion
zstyle ':completion:*' menu select
zstyle ':completion:*' group-name ''

# Configure colors for ls command (GNU coreutils)
if [[ "$(uname)" != "Darwin" ]]; then
    eval $(dircolors -b)
fi


# Download Znap, if it's not there yet.
[[ -r ~/Documents/GitHub/znap/znap.zsh ]] ||
    git clone --depth 1 -- https://github.com/marlonrichert/zsh-snap.git ~/Documents/GitHub/znap; chmod  +x ~/Documents/GitHub/znap/znap.zsh
source ~/Documents/GitHub/znap/znap.zsh  # Start Znap


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
