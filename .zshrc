
# Path to your oh-my-zsh installation.
export ZSH="$HOME/.config/oh-my-zsh"
export PATH=$HOME/bin:/usr/local/bin:$PATH
export FZF_BASE=/usr/bin/fzf
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
export PATH=$PATH:$HOME/.gem/ruby/2.7.0/bin
# XDG Base Directory Specification
# http://standards.freedesktop.org/basedir-spec/basedir-spec-latest.html
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_CACHE_HOME="$HOME/.cache"
export XDG_DATA_HOME="$HOME/.local/share"
export ZSH_CONFIG="$XDG_CONFIG_HOME/zsh"
export ZSH_CACHE="$XDG_CACHE_HOME/zsh"
export SCREENRC="$XDG_CONFIG_HOME"/screen/screenrc
export XINITRC="$XDG_CONFIG_HOME"/X11/xinitrc
export XSERVERRC="$XDG_CONFIG_HOME"/X11/xserverrc
export GEM_HOME=$HOME/.gem
mkdir -p $ZSH_CACHE
export VIMINIT=":source $XDG_CONFIG_HOME"/vim/vimrc
# executable search path
export PATH=/usr/local/sbin:$PATH
export PATH=$HOME/.local/bin:$PATH
export PATH=$HOME/.local/sbin:$PATH
export PATH=$HOME/.cargo/bin:$PATH

if [ -e /usr/share/terminfo/x/xterm-256color ]; then
        export TERM='xterm-256color'
else
        export TERM='xterm-color'
fi


plugins=(
    aws
    fzf
    git
    git-prompt
    github
    gitignore
    helm
    httpie
    kube-ps1
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
    vagrant
    vagrant-prompt
    vi-mode
    virtualenv
    virtualenvwrapper
    web-search
    zsh-autosuggestions
    zsh-completions
    zsh-interactive-cd
    zsh_reload
)

# Plugin Config

TIMER_FORMAT='[%d]'
source $ZSH/oh-my-zsh.sh
source $XDG_CONFIG_HOME/zsh/aliases.zsh
source $XDG_CONFIG_HOME/zsh/functions.zsh
source $XDG_CONFIG_HOME/zsh/minikube.zsh
#source $XDG_CONFIG_HOME/zsh/zplug/init.zsh


# User configuration


# History Settings (big history for use with many open shells and no dups)
# Different History files for root and standard user
if (( ! EUID )); then
    HISTFILE=$XDG_CONFIG_HOME/zsh/zsh_history
else
    HISTFILE=$XDG_CONFIG_HOME/zsh/zsh_history
fi
SAVEHIST=1000000
HISTSIZE=1200000
setopt share_history append_history extended_history hist_no_store hist_ignore_all_dups hist_ignore_space
# 2x control is completion from history!!!
#zle -C hist-complete complete-word _generic
#zstyle ':completion:hist-complete:*' completer _history
#bindkey '^X^X' hist-complete
# If a command is issued that can’t be executed as a normal command, and the command is the name of a directory, perform the cd command to that directory.
setopt AUTO_CD
# Treat  the ‘#’, ‘~’ and ‘^’ characters as part of patterns for filename generation, etc.  (An initial unquoted ‘~’ always produces named directory expansion.)
setopt EXTENDED_GLOB
# If a pattern for filename generation has no matches, print an error, instead of leaving it unchanged in the argument  list. This also applies to file expansion of an initial ‘~’ or ‘=’.
setopt NOMATCH
# no Beep on error in ZLE.
setopt NO_BEEP
# Remove  any right prompt from display when accepting a command line. This may be useful with terminals with other cut/paste methods.
setopt TRANSIENT_RPROMPT
# If unset, the cursor is set to the end of the word if completion is started. Otherwise it stays there and completion is done from both ends.
setopt COMPLETE_IN_WORD
# Make cd push the old directory onto the directory stack.
setopt AUTO_PUSHD
# Don’t push multiple copies of the same directory onto the directory stack.
setopt PUSHD_IGNORE_DUPS

# DON NOT Allow ‘>’ redirection to truncate existing files, and ‘>>’ to create files. Otherwise ‘>!’ or ‘>|’ must be used to truncate  a file, and ‘>>!’ or ‘>>|’ to create a file.
setopt no_clobber


if [ -z "$TMUX" ]; then
    tmux attach -t default || tmux new -s default
fi

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
[[ $commands[kubectl] ]] && source <(kubectl completion zsh) ]]

# ZSH Theme - Preview: https://gyazo.com/8becc8a7ed5ab54a0262a470555c3eed.png
local return_code="%(?..%{$fg[red]%}%? ↵%{$reset_color%})"

if [[ $UID -eq 0 ]]; then
    local user_host='%{$terminfo[bold]$fg[red]%}%n@%m %{$reset_color%}'
    local user_symbol='#'
else
    local user_host='%{$terminfo[bold]$fg[green]%}%n@%m %{$reset_color%}'
    local user_symbol='$'
fi

local current_dir='%{$terminfo[bold]$fg[blue]%}%~ %{$reset_color%}'
local git_branch='$(git_prompt_info)'
local rvm_ruby='$(ruby_prompt_info)'
local venv_prompt='$(virtualenv_prompt_info)'

ZSH_THEME_RVM_PROMPT_OPTIONS="i v g"

PROMPT="╭──$(kube_ps1)──${user_host}${current_dir}${rvm_ruby}${git_branch}${venv_prompt}
╰─%B${user_symbol}%b "
RPROMPT="%B${return_code}%b"

ZSH_THEME_GIT_PROMPT_PREFIX="%{$fg[yellow]%}‹"
ZSH_THEME_GIT_PROMPT_SUFFIX="› %{$reset_color%}"

ZSH_THEME_RUBY_PROMPT_PREFIX="%{$fg[red]%}‹"
ZSH_THEME_RUBY_PROMPT_SUFFIX="› %{$reset_color%}"

ZSH_THEME_VIRTUAL_ENV_PROMPT_PREFIX="%{$fg[green]%}‹"
ZSH_THEME_VIRTUAL_ENV_PROMPT_SUFFIX="› %{$reset_color%}"
ZSH_THEME_VIRTUALENV_PREFIX=$ZSH_THEME_VIRTUAL_ENV_PROMPT_PREFIX
ZSH_THEME_VIRTUALENV_SUFFIX=$ZSH_THEME_VIRTUAL_ENV_PROMPT_SUFFIX

export FZF_DEFAULT_OPS="--extended"

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
