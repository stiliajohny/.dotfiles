WORDCHARS=${WORDCHARS//\/} # Don't consider certain characters part of the word
PROMPT_EOL_MARK=""         # hide EOL sign ('%')

########################################
# PATH settings

# Keep PATH entries unique, including when starting nested shells.
typeset -U path PATH

export PATH="/opt/homebrew/bin:$PATH"
export PATH="/opt/homebrew/sbin:$PATH"
export PATH="/usr/local/sbin:$PATH"
export PATH="/usr/local/bin:$PATH"
export PATH="$HOME/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"
export PATH="$HOME/.local/sbin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"
export PATH="$PATH:$HOME/.rvm/bin"
export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"



# Java
export JAVA_HOME=$(/usr/libexec/java_home)
export PATH=$JAVA_HOME/bin:$PATH


# Go
export GOPATH=$HOME/go
export PATH="$GOPATH/bin:$PATH"

# Python
export PYENV_ROOT="$HOME/.pyenv"
if (( $+commands[pyenv] )); then
    path=("$PYENV_ROOT/bin" $path)
    eval "$(pyenv init --path)"
fi

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

# Oh My Zsh: XDG layout first, then default installer location (~/.oh-my-zsh).
if [[ -r "${XDG_CONFIG_HOME}/oh-my-zsh/oh-my-zsh.sh" ]]; then
    export ZSH="${XDG_CONFIG_HOME}/oh-my-zsh"
    elif [[ -r "${HOME}/.oh-my-zsh/oh-my-zsh.sh" ]]; then
    export ZSH="${HOME}/.oh-my-zsh"
else
    export ZSH="${XDG_CONFIG_HOME}/oh-my-zsh"
fi
export ZSH_CUSTOM="${ZSH}/custom"

export LANG=en_US.UTF-8


########################################
# Miscellaneous
mkdir -p $ZSH_CACHE
export VIMINIT=":source $XDG_CONFIG_HOME"/vim/vimrc
export COOKIECUTTER_CONFIG="$XDG_CONFIG_HOME/cookiecutterrc"
export TIMER_FORMAT='[%d]'
export ZSH_CUSTOM_AUTOUPDATE_QUIET=true
export UPDATE_ZSH_DAYS=13
export FZF_DEFAULT_OPTS="--extended"
export EDITOR="vim"

export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"


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
# Disabled: overlaps with autoupdate and Oh My Zsh's built-in updater.
# clone_if_not_exists "https://github.com/Pilaton/OhMyZsh-full-autoupdate.git" "$ZSH_CUSTOM/plugins/ohmyzsh-full-autoupdate"
# Disabled: terminal color support is native and this plugin was expensive.
# clone_if_not_exists "https://github.com/chrissicool/zsh-256color" "$ZSH_CUSTOM/plugins/zsh-256color"
clone_if_not_exists "https://github.com/zsh-users/zsh-autosuggestions" "$ZSH_CUSTOM/plugins/zsh-autosuggestions"
clone_if_not_exists "https://github.com/zsh-users/zsh-completions" "$ZSH_CUSTOM/plugins/zsh-completions"
clone_if_not_exists "https://github.com/zsh-users/zsh-history-substring-search" "$ZSH_CUSTOM/plugins/zsh-history-substring-search"
# Disabled: optional interactive navigation; restore if you use its widgets.
# clone_if_not_exists "https://github.com/mrjohannchang/zsh-interactive-cd" "$ZSH_CUSTOM/plugins/zsh-interactive-cd"
clone_if_not_exists "https://github.com/zsh-users/zsh-syntax-highlighting.git" "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting"

clone_if_not_exists "https://github.com/espressif/esp-idf.git" "${XDG_DATA_HOME}/esp-idf"



# Various Configs. The custom prompt is loaded from prompt.zsh after Oh My Zsh.
# ZSH_THEME="half-life"
ZSH_THEME=""
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=153'
DISABLE_MAGIC_FUNCTIONS=true
ZSH_POETRY_AUTO_ACTIVATE=1
ZSH_POETRY_AUTO_DEACTIVATE=1
SHOW_AWS_PROMPT=true
ZSH_THEME_AWS_PREFIX="AWS: "
ZSH_NVM_AUTOLOAD=true


# History Settings
if (( ! EUID )); then
    HISTFILE=$XDG_CONFIG_HOME/zsh-adds/zsh_history
else
    HISTFILE=$XDG_CONFIG_HOME/zsh-adds/zsh_history
fi
SAVEHIST=1000000
HISTSIZE=1200000

# Tmux
if [[ -o interactive && -t 0 && -z ${TMUX-} && ${TERM_PROGRAM-} != vscode ]]; then
    exec tmux new-session -A -s default
fi

# Configure colors for ls command (GNU coreutils)
if [[ "$(uname)" != "Darwin" ]]; then
    eval $(dircolors -b)
fi

if command -v zoxide &> /dev/null; then
eval "$(zoxide init zsh)"
fi


plugins=(
    kube-ps1
    aliases
    # ansible
    # asdf                    # pyenv and nvm are used instead
    autoupdate
    aws
    colored-man-pages
    colorize
    command-not-found
    fzf
    # gem
    git
    # git-auto-fetch          # performs background network work
    # git-extras
    # git-prompt              # prompt.zsh provides Git information
    # gitfast                 # duplicates the git plugin
    github
    gitignore
    helm
    history
    # httpie
    kubectl
    # lol
    macos
    magic-enter
    # mongocli
    # nmap
    node
    npm
    nvm
    # ohmyzsh-full-autoupdate # autoupdate is kept above
    # pep8
    pip
    poetry
    pyenv
    # pylint
    python
    safe-paste
    # screen                  # tmux is used instead
    ssh-agent
    sudo
    # systemd                 # not applicable on macOS
    # taskwarrior
    terraform
    thefuck
    # themes                  # prompt.zsh replaces theme switching
    # tig
    timer
    tmux
    # virtualenv              # poetry/python helpers already manage venvs
    vscode
    web-search
    # zsh-256color            # native terminal color support is sufficient
    zsh-autosuggestions
    zsh-completions
    zsh-history-substring-search
    # zsh-interactive-cd
    zsh-syntax-highlighting
)

# Source files and configurations
source_if_exists "$ZSH_CONFIG/completion.zsh"
source_if_exists "$ZSH_CONFIG/functions.zsh"
source_if_exists "$ZSH_CONFIG/kube-config.zsh"
source_if_exists "$ZSH_CONFIG/poetry.zsh"
source_if_exists "$ZSH_CONFIG/python-venv.zsh"
source_if_exists "$ZSH_CONFIG/terraform_prompt.zsh"



# ESP-IDF (under XDG_DATA_HOME, e.g. ~/.local/share/esp-idf). Suppress banner by default.
_esp_idf_export="${XDG_DATA_HOME}/esp-idf/export.sh"
if [[ -f "$_esp_idf_export" ]]; then
    if [[ -n "${ESP_IDF_EXPORT_LOUD}" ]]; then
        . "$_esp_idf_export"
    else
        . "$_esp_idf_export" >/dev/null 2>&1 || print "ESP-IDF: export failed (verbose: ESP_IDF_EXPORT_LOUD=1 . ${_esp_idf_export})" >&2
    fi
fi
unset _esp_idf_export

[[ -r "${ZSH}/oh-my-zsh.sh" ]] && source "${ZSH}/oh-my-zsh.sh"

# These depend on completion/plugin initialization or intentionally override
# aliases supplied by Oh My Zsh, so load them afterward.
source_if_exists "$ZSH_CONFIG/minikube.zsh"
source_if_exists "$ZSH_CONFIG/aliases.zsh"
source_if_exists "$ZSH_CONFIG/prompt.zsh"


# Added by LM Studio CLI (lms)
export PATH="$PATH:/Users/johnstilia/.lmstudio/bin"
# End of LM Studio CLI section


# bun completions

# bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Logi Build Haptics
source ~/.config/logi-build-haptics/integration.zsh

# >>> grok installer >>>
export PATH="$HOME/.grok/bin:$PATH"
fpath=(~/.grok/completions/zsh $fpath)
autoload -Uz compinit && compinit -C
# <<< grok installer <<<
