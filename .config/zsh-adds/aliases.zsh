alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'
alias tbc='nc termbin.com 9999 | xclip -selection c'

alias yay="clear; echo \"HAVE YOU PUT IT IN ANSIBLE?\""

alias t="tmux attach || tmux new-session"
alias ta="tmux attach -t"
alias tn="tmux new-session"
alias tl="tmux list-sessions"
alias tks="tmux kill-server"

alias vi="vim"
alias vim="vim"
alias aedit=" $EDITOR $ZSH_CONFIG/aliases.zsh; source $ZSH_CONFIG/aliases.zsh"
alias fedit=" $EDITOR $ZSH_CONFIG/functions.zsh; source $ZSH_CONFIG/functions.zsh"
alias pedit=" $EDITOR $ZSH_CONFIG/private.zsh; source $ZSH_CONFIG/private.zsh"
alias viedit=" $EDITOR $HOME/.vim/vimrc"

#alias man="unset PAGER; man"
alias grep='grep --color=auto'

alias sign='gpg --detach-sign --armor'

alias SimpleServer='firefox http://localhost:8000; python3 -m http.server'

##### standard aliases (start with a space to be ignored in history)
alias cls="clear"
if (( $+commands[eza] )); then
    alias ls='eza --group-directories-first'
    alias v='clear; eza -lbhHigUmuSa@ --time-style=long-iso --git --color-scale'
    alias l='eza -lbF --git'
    alias ll='eza -lbGF --git'
    alias llm='eza -lbGd --git --sort=modified'
    alias la='eza -lbhHigUmuSa --time-style=long-iso --git --color-scale'
    alias lx='eza -lbhHigUmuSa@ --time-style=long-iso --git --color-scale'
    alias lS='eza -1'
    alias lt='eza --tree --level=2'
elif (( $+commands[exa] )); then
    alias ls='exa --group-directories-first'
    alias v='clear; exa -lbhHigUmuSa@ --time-style=long-iso --git --color-scale'
    alias l='exa -lbF --git'
    alias ll='exa -lbGF --git'
    alias llm='exa -lbGd --git --sort=modified'
    alias la='exa -lbhHigUmuSa --time-style=long-iso --git --color-scale'
    alias lx='exa -lbhHigUmuSa@ --time-style=long-iso --git --color-scale'
    alias lS='exa -1'
    alias lt='exa --tree --level=2'
else
    alias ls='ls -G'
    alias v='clear; ls -lAh'
    alias l='ls -l'
    alias ll='ls -l'
    alias llm='ls -lt'
    alias la='ls -lAh'
    alias lx='ls -lAh'
    alias lS='ls -1'
    alias lt='find . -maxdepth 2 -print'
fi


alias p='ps aux | grep'
alias g='git'
alias lg='lazygit'
alias d=' dirs -v'
alias ka="killall"

alias cd='cd'
alias ..='cd ..; ls'
alias ...='cd ..; cd ..; ls'
alias ....='cd ..; cd ..; cd ..; ls'
alias cd..='..'
alias cd...='...'
alias cd....='....'

alias k9='kill -9'

##### global aliases
# zsh buch s.82 (z.B. find / ... NE)
alias -g NE='2>|/dev/null'
alias -g NO='&>|/dev/null'
alias -g EO='>|/dev/null'

# http://rayninfo.co.uk/tips/zshtips.html
alias -g G='| grep '
alias -g J='| jq '
alias -g P='2>&1 | $PAGER'
alias -g M='| most'
alias -g L='| less'
alias -g LA='2>&1 | less'
alias -g CL='| wc -l'
alias -g CC='| wc -m'
alias -g CW='| wc -w'
alias -g TB="| nc termbin.com 9999"
alias -g TN='| terminal-notifier -message " Task Finished" '



##### suffix aliases (mostly mapped to open which runs the gnome/kde default app)

alias -s Dockerfile="docker build - < "

alias ocr='docker run --rm -v `pwd`:/home/docker jbarlow83/ocrmypdf --skip-text'
alias -s tex='docker run -i -t --rm -v `pwd`:/data docker-registry.eccenca.com/eccenca-latex:v1.10.0 rubber --inplace --maxerr -1 --short --force --warn all --pdf'

alias -s 1="man -l"
alias -s 2="man -l"
alias -s 3="man -l"
alias -s 4="man -l"
alias -s 5="man -l"
alias -s 6="man -l"
alias -s 7="man -l"

alias gst="git status"
alias ga="git add "
alias gcman="git commit -am "
alias gph="git push "
alias git-pull-all="ls | xargs -P10 -I{} git -C {} pull"
alias git-status-all="ls | xargs -P10 -I{} git -C {} status"
alias git-add-all="ls | xargs -P10 -I{} git -C {} add ."
_confirm_destructive() {
    local answer
    print -n -- "$1 [y/N] "
    read -r answer
    [[ "$answer" == [yY] || "$answer" == [yY][eE][sS] ]]
}

git-reset-all-hard() {
    _confirm_destructive "Reset every child Git repository with --hard?" || return 1
    local repo
    for repo in *(/N); do
        git -C "$repo" rev-parse --is-inside-work-tree >/dev/null 2>&1 &&
            git -C "$repo" reset --hard
    done
}

git-reset-all-soft() {
    _confirm_destructive "Reset every child Git repository with --soft?" || return 1
    local repo
    for repo in *(/N); do
        git -C "$repo" rev-parse --is-inside-work-tree >/dev/null 2>&1 &&
            git -C "$repo" reset --soft
    done
}

alias dk='docker'
alias dki='docker images'
alias dks='docker service'
alias dkrm='docker rm'
alias dkl='docker logs'
alias dklf='docker logs -f'
dkflush() {
    _confirm_destructive "Remove all Docker containers?" || return 1
    local -a containers
    containers=("${(@f)$(docker ps --no-trunc -aq)}")
    (( ${#containers} )) && docker rm -- "${containers[@]}"
}

dkflush2() {
    _confirm_destructive "Remove all dangling Docker images?" || return 1
    local -a images
    images=("${(@f)$(docker images --filter 'dangling=true' -q --no-trunc)}")
    (( ${#images} )) && docker rmi -- "${images[@]}"
}
alias dkt='docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"'
alias dkps="docker ps --format '{{.ID}} ~ {{.Names}} ~ {{.Status}} ~ {{.Image}}'"

alias c='docker-compose'
alias cb='docker-compose build'
alias cup='docker-compose up'
alias cupd='docker-compose up -d'
alias cdown='docker-compose down'
alias cr='docker-compose run --service-ports --rm'
alias crl='docker-compose run --service-ports --rm local'
alias crd='docker-compose run --service-ports --rm develop'
alias crt='docker-compose run --rm test'
alias crp='docker-compose run --rm provision'
alias crci='docker-compose run --rm ci'
alias crwt='docker-compose run --rm watchtest'
alias cps='docker-compose ps'
alias clogs='docker-compose logs'

docker-destroy-all() {
    _confirm_destructive "Prune Docker images, networks, volumes, and containers?" || return 1
    docker system prune -a -f &&
        docker network prune -f &&
        docker volume prune -f &&
        docker container prune -f
}

cacheclear() {
    _confirm_destructive "Delete the contents of $HOME/Library/Caches?" || return 1
    rm -rfv -- "$HOME/Library/Caches/"*(DN)
}

alias b='bundle exec'

alias wiki="vim -c \'execute \"normal \\ww\"\'"

alias lal='ls -al'
alias lh='ls -lh'

alias vup="FORWARD_DOCKER_PORTS=1 FORWARD_50K_PORTS=1 vagrant up"
alias valt="vagrant halt"
alias vsleep="vagrant suspend"
alias vwake="vagrant resume"
alias vssh="vagrant ssh"

alias top='htop'

alias h='history'

alias tb2='tar -jxvf'
alias tbz='tar -zxvf'
alias b2='bzip2 -d'
alias b2z='bzip2 -z'


alias bigdir="du -hsx * | sort -rh | head -10"
alias cgit='cd ~/Documents/Projects/ && mgitstatus'

alias k=kubectl
alias test-passed='if [ "$?" -eq "0" ]; then lolcat ~/.config/zsh/tp -a -s 40 -d 2; fi;'



alias tf='terraform'
alias tfa='terraform apply'
alias tfc='terraform console'
unalias tfd tfwde tfsrm tfay tfdy 2>/dev/null
tfd() {
    _confirm_destructive "Run terraform destroy?" || return 1
    terraform destroy "$@"
}
alias tff='terraform fmt'
alias tfg='terraform graph'
alias tfim='terraform import'
alias tfin='terraform init'
alias tfo='terraform output'
alias tfp='terraform plan'
alias tfpr='terraform providers'
alias tfr='terraform refresh'
alias tfsh='terraform show'
alias tft='terraform taint'
alias tfut='terraform untaint'
alias tfv='terraform validate'
alias tfw='terraform workspace'
alias tfs='terraform state'
alias tffu='terraform force-unlock'
alias tfwst='terraform workspace select'
alias tfwsw='terraform workspace show'
alias tfssw='terraform state show'
tfwde() {
    _confirm_destructive "Delete a Terraform workspace?" || return 1
    terraform workspace delete "$@"
}
alias tfwls='terraform workspace list'
alias tfsls='terraform state list'
alias tfwnw='terraform workspace new'
alias tfsmv='terraform state mv'
alias tfspl='terraform state pull'
alias tfsph='terraform state push'
tfsrm() {
    _confirm_destructive "Remove objects from Terraform state?" || return 1
    terraform state rm "$@"
}

tfay() {
    _confirm_destructive "Apply Terraform changes with auto-approval?" || return 1
    terraform apply -auto-approve "$@"
}

tfdy() {
    _confirm_destructive "Destroy Terraform resources with auto-approval?" || return 1
    terraform destroy -auto-approve "$@"
}
alias tfinu='terraform init -upgrade'
alias tfpde='terraform plan --destroy'


alias decode_and_copy='echo "$1" | base64 -d | pbcopy'
alias encode_and_copy='echo "$1" | base64 | pbcopy'
alias decode='echo "$1" | base64 -d'
alias encode='echo "$1" | base64'
alias decode_and_paste='pbpaste | base64 -d'
alias encode_and_paste='pbpaste | base64'
