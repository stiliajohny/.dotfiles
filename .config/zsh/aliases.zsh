
alias vpnconnectJohnStilia="sudo openvpn --daemon --auth-nocache --cd "/etc/openvpn/conf.d" --config "vpn-johnstilia-co-uk.ovpn""
alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'
alias tbc='nc termbin.com 9999 | xclip -selection c'
alias in-office='xrandr --output eDP1 --off --output DP1-1 --primary --mode 1920x1080 --pos 1080x1320 --rotate normal --output DP1-2 --mode 2560x1080 --pos 0x0 --rotate right'

alias yayy="yay --noconfirm"
alias yay="clear; echo \"HAVE YOU PUT IT IN ANSIBLE?\""
export EDITOR="vim"

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
alias rm="echo Use 'rmtrash', or the full path i.e. '/bin/rm'"

#alias man="unset PAGER; man"
alias grep='grep --color=auto'

alias sign='gpg --detach-sign --armor'

alias SimpleServer='open http://localhost:8000; python -m SimpleHTTPServer'

##### standard aliases (start with a space to be ignored in history)
alias ll="ls -lhS"
alias cls="clear"
alias ls=' exa --group-directories-first'
alias v="clear; exa --git -h -l --group-directories-first --time-style long-iso --color automatic"
alias l="v"

alias p=' ps aux | grep'
alias g='git'
alias d=' dirs -v'
alias ka="killall"

alias cd=' cd'
alias ..=' cd ..; ls'
alias ...=' cd ..; cd ..; ls'
alias ....=' cd ..; cd ..; cd ..; ls'
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
alias -g P='2>&1 | $PAGER'
alias -g L='| less'
alias -g LA='2>&1 | less'
alias -g M='| most'
alias -g C='| wc -l'


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
alias git-reset-all-hard="ls | xargs -P10 -I{} git -C {} reset --hard"
alias git-reset-all-soft="ls | xargs -P10 -I{} git -C {} reset --soft"

alias dk='docker'
alias dki='docker images'
alias dks='docker service'
alias dkrm='docker rm'
alias dkl='docker logs'
alias dklf='docker logs -f'
alias dkflush='docker rm `docker ps --no-trunc -aq`'
alias dkflush2='docker rmi $(docker images --filter "dangling=true" -q --no-trunc)'
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

alias docker-destroy-all='docker system prune -a -f && docker network prune -f && docker volume prune -f && docker container prune -f '

crm() {
	docker-compose stop $1
	docker-compose rm --force $1
}

alert() {
	current_volume="$(pamixer --get-volume)"
	need_volume="70"
	pactl set-sink-volume 0 $need_volume%
	cvlc -q  --play-and-exit ~/.local/share/sounds/PM_BlurryDreams_06.mp3  2> /dev/null
	pactl set-sink-volume 0 $current_volume%
}
alias cacheclear="rm -rfv ~/Library/Caches/"

alias b='bundle exec'

alias ll='ls -l'

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
alias ssh='autossh -M shuf -i 1000-2000 -n 1'

function find_in() { find . -name $1 -print | xargs grep --color=auto -inH $2; }

alias bigdir="du -hsx * | sort -rh | head -10"
alias mkdr='mkdir $1 && cd ./$1'
alias cgit='cd ~/Documents/GitHub/ && mgitstatus'

alias k=kubectl
alias test-passed='if [ "$?" -eq "0" ]; then lolcat ~/.config/zsh/tp -a -s 40 -d 2; fi;'
