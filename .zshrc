# CodeWhisperer pre block. Keep at the top of this file.
[[ -f "${HOME}/Library/Application Support/codewhisperer/shell/zshrc.pre.zsh" ]] && builtin source "${HOME}/Library/Application Support/codewhisperer/shell/zshrc.pre.zsh"
WORDCHARS=${WORDCHARS//\/} # Don't consider certain characters part of the word
PROMPT_EOL_MARK=""         # hide EOL sign ('%')

# Enable completion features
autoload -Uz compinit
compinit -d ~/.cache/zcompdump

########################################
# PATH settings

export ZSH="$HOME/.config/oh-my-zsh"
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
export ZSH_CONFIG="$XDG_CONFIG_HOME/zsh-adds"
export ZSH_CACHE="$XDG_CACHE_HOME/zsh"
export ZSH_COMPDUMP="$ZSH_CONFIG/zcomdump"
export SCREENRC="$XDG_CONFIG_HOME"/screen/screenrc
export XINITRC="$XDG_CONFIG_HOME"/X11/xinitrc
export XSERVERRC="$XDG_CONFIG_HOME"/X11/xserverrc




########################################
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
export ZSH_CUSTOM="$HOME/.config/oh-my-zsh/custom"


# Magic Enter
# defaults
MAGIC_ENTER_GIT_COMMAND='git status -u .'
MAGIC_ENTER_OTHER_COMMAND='ls -lh .'

#  TMUX Options for zsh tmux plugin
ZSH_TMUX_ITERM2=true


clone_if_not_exists() {
    local repo_url="$1"
    local target_dir="$2"
    
    # Extract the name of the repository from the URL
    local repo_name=$(basename -s .git "$repo_url")
    
    # Full path to the target directory
    local full_path="$target_dir"
    
    # Check if the directory already exists
    if [ -d "$full_path" ]; then
    else
        # Clone the repository
        git clone "$repo_url" "$full_path"
        echo "Cloned $repo_url into $full_path"
    fi
}

source_if_exists() {
    local file_path="$1"
    
    # Check if the file exists and is not empty
    if [ -f "$file_path" ]; then
        source "$file_path"
    else
        echo "File not found: $file_path"
    fi
}

# Check if plugins are installed and install them if not
clone_if_not_exists "https://github.com/TamCore/autoupdate-oh-my-zsh-plugins" "$ZSH_CUSTOM/plugins/autoupdate"
clone_if_not_exists "https://github.com/Pilaton/OhMyZsh-full-autoupdate.git" "$ZSH_CUSTOM/plugins/ohmyzsh-full-autoupdate"
clone_if_not_exists "https://github.com/chrissicool/zsh-256color" "$ZSH_CUSTOM/plugins/zsh-256color"
clone_if_not_exists "https://github.com/zsh-users/zsh-autosuggestions" "$ZSH_CUSTOM/plugins/zsh-autosuggestions"
clone_if_not_exists "https://github.com/zsh-users/zsh-completions" "$ZSH_CUSTOM/plugins/zsh-completions"
clone_if_not_exists "https://github.com/zsh-users/zsh-history-substring-search" "$ZSH_CUSTOM/plugins/zsh-history-substring-search"
clone_if_not_exists "https://github.com/mrjohannchang/zsh-interactive-cd" "$ZSH_CUSTOM/plugins/zsh-interactive-cd"
clone_if_not_exists "https://github.com/zsh-users/zsh-syntax-highlighting.git" "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting"
clone_if_not_exists "https://github.com/wbingli/zsh-wakatime.git" "$ZSH_CUSTOM/plugins/zsh-wakatime"


#  Various Configs
ZSH_THEME="half-life"
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=60'
DISABLE_MAGIC_FUNCTIONS=true
ZSH_POETRY_AUTO_ACTIVATE=1
ZSH_POETRY_AUTO_DEACTIVATE=1
SHOW_AWS_PROMPT=true
ZSH_THEME_AWS_PREFIX="AWS: "


# History Settings
if (( ! EUID )); then
    HISTFILE=$XDG_CONFIG_HOME/zsh-adds/zsh_history
else
    HISTFILE=$XDG_CONFIG_HOME/zsh-adds/zsh_history
fi
SAVEHIST=1000000
HISTSIZE=1200000

# Tmux
if [ -z "$TMUX" ] && [ "$TERM_PROGRAM" != "vscode" ]; then
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

# Configure colors for ls command (GNU coreutils)
if [[ "$(uname)" != "Darwin" ]]; then
    eval $(dircolors -b)
fi



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
    thefuck
    themes
    tig
    timer
    tmux
    virtualenv
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

# Source files and configurations
source_if_exists "$ZSH_CONFIG/aliases.zsh"
source_if_exists "$ZSH_CONFIG/completion.zsh"
source_if_exists "$ZSH_CONFIG/functions.zsh"
source_if_exists "$ZSH_CONFIG/kube-config.zsh"
source_if_exists "$ZSH_CONFIG/minikube.zsh"
source_if_exists "$ZSH_CONFIG/poetry.zsh"
source_if_exists "$ZSH_CONFIG/terraform_prompt.zsh"
source_if_exists "$ZSH_CONFIG/kube-ps1.sh"

source $ZSH/oh-my-zsh.sh


# CodeWhisperer post block. Keep at the bottom of this file.
[[ -f "${HOME}/Library/Application Support/codewhisperer/shell/zshrc.post.zsh" ]] && builtin source "${HOME}/Library/Application Support/codewhisperer/shell/zshrc.post.zsh"
