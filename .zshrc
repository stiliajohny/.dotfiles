

# ZSH Options
setopt autocd               # change directory just by typing its name
setopt correct              # auto correct mistakes
setopt interactivecomments  # allow comments in interactive mode
setopt magicequalsubst      # enable filename expansion for arguments of the form ‘anything=expression’
setopt nonomatch            # hide error message if there is no match for the pattern
setopt notify               # report the status of background jobs immediately
setopt numericglobsort      # sort filenames numerically when it makes sense
setopt promptsubst          # enable command substitution in prompt
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
export PATH=$HOME/bin:/usr/local/bin:$PATH
export PATH=$HOME/.local/bin:$PATH
export PATH=$HOME/.local/sbin:$PATH
export PATH=$HOME/.cargo/bin:$PATH
export PATH=$HOME/Documents/flutter/flutter/bin:$PATH
export PATH="${PATH}:${HOME}/.krew/bin"
export PATH=$PATH:$GOPATH/bin
export PATH=$PATH:$HOME/.gem/ruby/2.7.0/bin
export PATH=$PATH:$HOME/.gem/ruby/3.0.0/bin
export PATH=$PATH:$HOME/.gem/bin
export PATH=/usr/local/sbin:$PATH

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
export CHROME_EXECUTABLE=/Applications/Arc.app/Contents/MacOS/Arc

# Plugins
plugins=(
    wakatime
    zsh-256color
    aws
    fzf
    git
    git-prompt
    github
    gitignore
    helm
    httpie
    lol
    pep8
    pip
    pyenv
    python
    sudo
    systemd
    terraform
    themes
    tig
    timer
    tmux
    virtualenv
    virtualenvwrapper
    web-search
    zsh-autosuggestions
    zsh-completions
    zsh-history-substring-search
    zsh-interactive-cd
)

ZSH_THEME="mh"

# Source files and configurations
[ -f $ZSH/oh-my-zsh.sh ] && source $ZSH/oh-my-zsh.sh
[[ $commands[kubectl] ]] && source <(kubectl completion zsh)
[ -f $XDG_CONFIG_HOME/zsh/aliases.zsh ] && source $XDG_CONFIG_HOME/zsh/aliases.zsh
[ -f $XDG_CONFIG_HOME/zsh/completion.zsh ] && source $XDG_CONFIG_HOME/zsh/completion.zsh
[ -f $XDG_CONFIG_HOME/zsh/functions.zsh ] && source $XDG_CONFIG_HOME/zsh/functions.zsh
[ -f $XDG_CONFIG_HOME/zsh/kube-config.zsh ] && source  $XDG_CONFIG_HOME/zsh/kube-config.zsh
[ -f $XDG_CONFIG_HOME/zsh/minikube.zsh ] && source $XDG_CONFIG_HOME/zsh/minikube.zsh
[ -f $XDG_CONFIG_HOME/zsh/vagrant.zsh ] && source  $XDG_CONFIG_HOME/zsh/vagrant.zsh
[ -f $XDG_CONFIG_HOME/zsh/poetry.zsh ] && source  $XDG_CONFIG_HOME/zsh/poetry.zsh
[ -f $XDG_CONFIG_HOME/zsh/terraform_prompt.zsh ] && source  $XDG_CONFIG_HOME/zsh/terraform_prompt.zsh

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
setopt share_history append_history extended_history hist_no_store hist_ignore_all_dups hist_ignore_space
setopt AUTO_CD
setopt EXTENDED_GLOB
setopt NOMATCH
setopt NO_BEEP
setopt TRANSIENT_RPROMPT
setopt COMPLETE_IN_WORD
setopt AUTO_PUSHD
setopt PUSHD_IGNORE_DUPS
setopt no_clobber

# Tmux
if [ -z "$TMUX" ]; then
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

export FZF_DEFAULT_OPS="--extended"
[ -f  $HOME/.config/zsh/.fzf.zsh ] && source $HOME/.config/zsh/.fzf.zsh

# Pyenv initialization
if command -v pyenv 1>/dev/null 2>&1; then
  eval "$(pyenv init -)"
fi

# Docker Desktop initialization
source /Users/johnstilia/.docker/init-zsh.sh || true # Added by Docker Desktop

# Customize prompt
PROMPT_EOL_MARK=""
setopt promptsubst


# Custom prompt

# kube context
kube_context() {
  if [[ -n "$(which kubectl)" ]]; then
    local context="$(kubectl config current-context 2>/dev/null)"
    local namespace="$(kubectl config view --minify --output 'jsonpath={..namespace}' 2>/dev/null)"
    if [[ -n "${context}" ]]; then
      if [[ -z "${namespace}" ]]; then
        namespace="default"
      fi
      echo "${cyan}[${context}:${namespace}]${reset}"
    fi
  fi
}


# Virtual Environment
if [[ -n "$VIRTUAL_ENV" ]]; then
  local venv_name=$(basename $VIRTUAL_ENV)
  local venv_prompt="(${venv_name}) "
else
  local venv_prompt=""
fi

aws_profile() {
  if [ -z "${AWS_PROFILE}" ]; then
    echo ""
  elif [ -z "$(echo -e "${AWS_PROFILE}" | tr -d '[:space:]')" ]; then
    echo "|AWS: ${yellow}unknown${reset}"
  else
    echo "|AWS: ${yellow}${AWS_PROFILE}${reset}"
  fi
}

terraform_workspace() {
  if [[ -d .terraform ]]; then
    local workspace=$(terraform workspace show 2>/dev/null)
    if [[ -n "${workspace}" ]]; then
      echo "|Terraform: ${yellow}${workspace}${reset}"
    else
      echo "|Terraform: ${yellow}unknown${reset}"
    fi
  fi
}

# Custom funky theme
funky_theme() {
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


  # Main prompt
  PROMPT="${venv_prompt}${user_host} ${current_dir} ${git_info} ${blue}${reset} "
  PROMPT+=$'\n'"%{%}$(kube_context)$(aws_profile)$(terraform_workspace) ${prompt_symbol} %{%}"

  # Set up right prompt
  RPROMPT="${cyan}%D{%H:%M}${reset}"

  # Configure completion
  zstyle ':completion:*' menu select
  zstyle ':completion:*' group-name ''

  # Configure colors for ls command (GNU coreutils)
  if [[ "$(uname)" != "Darwin" ]]; then
      eval $(dircolors -b)
  fi
}

# Apply the funky_theme
funky_theme



# End of the organized ZSH config file
