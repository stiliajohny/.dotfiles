# Trigger ~/.bashrc commands
. ~/.bashrc

export PATH="$HOME/.poetry/bin:$PATH"

#AWSume alias to source the AWSume script
alias awsume="source \$(pyenv which awsume)"

#Auto-Complete function for AWSume
_awsume() {
    local cur prev opts
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"
    opts=$(awsume-autocomplete)
    COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
    return 0
}
complete -F _awsume awsume

source /Users/johnstilia/.docker/init-bash.sh || true # Added by Docker Desktop
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
