# Run the colorscript script at first
# ~/.config/zsh/shell-color-scripts/colorscript.sh -r



setopt autocd              # change directory just by typing its name
setopt correct            # auto correct mistakes
setopt interactivecomments # allow comments in interactive mode
setopt magicequalsubst     # enable filename expansion for arguments of the form ‘anything=expression’
setopt nonomatch           # hide error message if there is no match for the pattern
setopt notify              # report the status of background jobs immediately
setopt numericglobsort     # sort filenames numerically when it makes sense
setopt promptsubst         # enable command substitution in prompt


WORDCHARS=${WORDCHARS//\/} # Don't consider certain characters part of the word

# hide EOL sign ('%')
# PROMPT_EOL_MARK=""

# # configure key keybindings
# bindkey -e                                        # emacs key bindings
# bindkey ' ' magic-space                           # do history expansion on space
# bindkey '^U' backward-kill-line                   # ctrl + U
# bindkey '^[[3;5~' kill-word                       # ctrl + Supr
# bindkey '^[[3~' delete-char                       # delete
# bindkey '^[[1;5C' forward-word                    # ctrl + ->
# bindkey '^[[1;5D' backward-word                   # ctrl + <-
# bindkey '^[[5~' beginning-of-buffer-or-history    # page up
# bindkey '^[[6~' end-of-buffer-or-history          # page down
# bindkey '^[[H' beginning-of-line                  # home
# bindkey '^[[F' end-of-line                        # end
# bindkey '^[[Z' undo                               # shift + tab undo last action

# enable completion features
autoload -Uz compinit
compinit -d ~/.cache/zcompdump
zstyle ':completion:*:*:*:*:*' menu select
zstyle ':completion:*' auto-description 'specify: %d'
zstyle ':completion:*' completer _expand _complete
zstyle ':completion:*' format 'Completing %d'
zstyle ':completion:*' group-name ''
zstyle ':completion:*' list-colors ''
zstyle ':completion:*' list-prompt %SAt %p: Hit TAB for more, or the character to insert%s
zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}'
zstyle ':completion:*' rehash true
zstyle ':completion:*' select-prompt %SScrolling active: current selection at %p%s
zstyle ':completion:*' use-compctl false
zstyle ':completion:*' verbose true
zstyle ':completion:*:kill:*' command 'ps -u $USER -o pid,%cpu,tty,cputime,cmd'



if [ -e /usr/share/terminfo/x/xterm-256color ]; then
        export TERM='xterm-256color'
else
        export TERM='xterm-color'
fi

# executable search path
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
export PATH=$PATH:$HOME/.gem/ruby/2.7.0/bin
export PATH=$PATH:$HOME/.gem/ruby/3.0.0/bin
export PATH=/usr/local/sbin:$PATH
export PATH=$HOME/.local/bin:$PATH
export PATH=$HOME/.local/sbin:$PATH
export PATH=$HOME/.cargo/bin:$PATH

export PATH=$HOME/bin:/usr/local/bin:$PATH
export JAVA_HOME='/usr/lib/jvm/java-17-openjdk/'
export PATH=$JAVA_HOME/bin:$PATH



export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init --path)"


export PAGER=""
export ZSH="$HOME/.config/oh-my-zsh"
export FZF_BASE=/usr/bin/fzf


# XDG Base Directory Specification
# http://standards.freedesktop.org/basedir-spec/basedir-spec-latest.html
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_CACHE_HOME="$HOME/.cache"
export XDG_DATA_HOME="$HOME/.local/share"
export ZSH_CONFIG="$XDG_CONFIG_HOME/zsh"
export ZSH_CACHE="$XDG_CACHE_HOME/zsh"
export ZSH_COMPDUMP="$ZSH_CONFIG/zcomdump"
export SCREENRC="$XDG_CONFIG_HOME"/screen/screenrc
export XINITRC="$XDG_CONFIG_HOME"/X11/xinitrc
export XSERVERRC="$XDG_CONFIG_HOME"/X11/xserverrc
export GEM_HOME=$HOME/.gem
export PATH="$HOME/.poetry/bin:$PATH"
mkdir -p $ZSH_CACHE
export VIMINIT=":source $XDG_CONFIG_HOME"/vim/vimrc
export COOKIECUTTER_CONFIG="$XDG_CONFIG_HOME/cookiecutterrc"

export CHROME_EXECUTABLE=/usr/bin/google-chrome-stable

export sky_user_email="john.stilia@sky.uk"
export sky_mfa_mode="sms"
TIMER_FORMAT='[%d]'


plugins=(
    zsh-wakatime
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
    vagrant
    vagrant-prompt
    vi-mode
    virtualenv
    virtualenvwrapper
    web-search
    zsh-autosuggestions
    zsh-completions
    zsh-history-substring-search
    zsh-interactive-cd
    )
ZSH_THEME="mh"

[ -f $ZSH/oh-my-zsh.sh ] && source $ZSH/oh-my-zsh.sh
[[ $commands[kubectl] ]] && source <(kubectl completion zsh) ]]
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


# ZSH Theme - Preview: https://gyazo.com/8becc8a7ed5ab54a0262a470555c3eed.png

# # local return_code="%(?..%{$fg[red]%}%? ↵ %{$reset_color%})"

# if [[ $UID -eq 0 ]]; then
#     local user_host='%{$terminfo[bold]$fg[red]%}%n@%m %{$reset_color%}'
#     local user_symbol='#'
# else
#     local user_host='%{$terminfo[bold]$fg[green]%}%n@%m %{$reset_color%}'
#     local user_symbol='$'
# fi

# local current_dir='%{$terminfo[bold]$fg[blue]%}%~ %{$reset_color%}'
# local git_branch='$(git_prompt_info)'
# local rvm_ruby='$(ruby_prompt_info)'
# local venv_prompt='$(virtualenv_prompt_info)'

# ZSH_THEME_RVM_PROMPT_OPTIONS="i v g"

# PROMPT="
# ${user_host}${current_dir}${rvm_ruby}${git_branch}${venv_prompt}
# %B${user_symbol}%b "
# # RPROMPT="%B${return_code}%b"

# ZSH_THEME_GIT_PROMPT_PREFIX="%{$fg[yellow]%}‹"
# ZSH_THEME_GIT_PROMPT_SUFFIX="› %{$reset_color%}"

# ZSH_THEME_RUBY_PROMPT_PREFIX="%{$fg[red]%}‹"
# ZSH_THEME_RUBY_PROMPT_SUFFIX="› %{$reset_color%}"

# ZSH_THEME_VIRTUAL_ENV_PROMPT_PREFIX="%{$fg[green]%}‹"
# ZSH_THEME_VIRTUAL_ENV_PROMPT_SUFFIX="› %{$reset_color%}"
# ZSH_THEME_VIRTUALENV_PREFIX=$ZSH_THEME_VIRTUAL_ENV_PROMPT_PREFIX
# ZSH_THEME_VIRTUALENV_SUFFIX=$ZSH_THEME_VIRTUAL_ENV_PROMPT_SUFFIX


###################
# KUBECONFIG for multiople clusters

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
if command -v pyenv 1>/dev/null 2>&1; then
  eval "$(pyenv init -)"
fi
