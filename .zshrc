

# ZSH Options
# setopt AUTO_PUSHD           # push the old directory onto the directory stack after pushing the current directory when using cd
# setopt autocd               # change directory just by typing its name
# setopt COMPLETE_IN_WORD     # allow completion from within a word/phrase
# setopt correct              # auto correct mistakes
# setopt EXTENDED_GLOB        # enable extended globbing
# setopt interactivecomments  # allow comments in interactive mode
# setopt magicequalsubst      # enable filename expansion for arguments of the form ‘anything=expression’
# setopt NO_BEEP              # disable bell
# setopt no_clobber           # do not overwrite existing files with redirection
# setopt nonomatch            # hide error message if there is no match for the pattern
# setopt notify               # report the status of background jobs immediately
# setopt numericglobsort      # sort filenames numerically when it makes sense
# setopt promptsubst          # enable command substitution in prompt
# setopt PUSHD_IGNORE_DUPS    # do not store duplicates in the stack
# setopt share_history append_history extended_history hist_no_store hist_ignore_all_dups hist_ignore_space
# setopt TRANSIENT_RPROMPT
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
ZSH_CUSTOM_AUTOUPDATE_QUIET=true
export UPDATE_ZSH_DAYS=13


# Plugins
plugins=(
    autoupdate
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
    thefuck
    virtualenv
    virtualenvwrapper
    zsh-wakatime
    web-search
    zsh-256color
    zsh-autosuggestions
    zsh-completions
    zsh-history-substring-search
    zsh-interactive-cd
    ohmyzsh-full-autoupdate
    zsh-syntax-highlighting
)

# ZSH_THEME="mh"

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
# . "$HOME/.asdf/asdf.sh" if it exists load it make it onle liner as above
[ -f "$HOME/.asdf/asdf.sh" ] && source "$HOME/.asdf/asdf.sh"

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


# Main prompt
PROMPT='${user_host} ${current_dir} $(git_prompt_info) ${blue}${reset}
$(kube_context)$(aws_profile)$(virtualenv_info)$(terraform_workspace) ${prompt_symbol} %{%}'

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
    git clone --depth 1 -- https://github.com/marlonrichert/zsh-snap.git ~/Documents/GitHub/znap
source ~/Documents/GitHub/znap/znap.zsh  # Start Znap


# End of the organized ZSH config file
