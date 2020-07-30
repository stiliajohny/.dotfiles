# @author     Sebastian Tramp <mail@sebastian.tramp.name>
# @license    http://opensource.org/licenses/gpl-license.php
#
# alias definitions which can be edited/modified with 'aedit'
#
alias vpnconnectJohnStilia="openvpn --daemon --auth-nocache --cd "/etc/openvpn/conf.d" --config "vpn-johnstilia-co-uk.ovpn""

alias ll="ls -lhS"
alias cls="clear"

export EDITOR="vim"
# But still use emacs-style zsh bindings
# http://superuser.com/questions/403355/how-do-i-get-searching-through-my-command-history-working-with-tmux-and-zshell
bindkey -e

alias vi="vim"
alias vim="vim"
alias aedit=" $EDITOR $ZSH_CONFIG/aliases.zsh; source $ZSH_CONFIG/aliases.zsh"
alias fedit=" $EDITOR $ZSH_CONFIG/functions.zsh; source $ZSH_CONFIG/functions.zsh"
alias pedit=" $EDITOR $ZSH_CONFIG/private.zsh; source $ZSH_CONFIG/private.zsh"
alias viedit=" $EDITOR $HOME/.vim/vimrc"
alias rm="echo Use 'rmtrash', or the full path i.e. '/bin/rm'"

# N-Triples aliases from http://blog.datagraph.org/2010/03/grepping-ntriples
alias rdf-count="awk '/^\s*[^#]/ { n += 1 } END { print n }'"
alias rdf-lengths="awk '/^\s*[^#]/ { print length }'"
alias rdf-length-avg="awk '/^\s*[^#]/ { n += 1; s += length } END { print s/n }'"
alias rdf-length-max="awk 'BEGIN { n=0 } /^\s*[^#]/ { if (length>n) n=length } END { print n }'"
alias rdf-length-min="awk 'BEGIN { n=1e9 } /^\s*[^#]/ { if (length>0 && length<n) n=length } END { print (n<1e9 ? n : 0) }'"
alias rdf-subjects="awk '/^\s*[^#]/ { print \$1 }' | uniq"
alias rdf-predicates="awk '/^\s*[^#]/ { print \$2 }' | uniq"
alias rdf-objects="awk '/^\s*[^#]/ { ORS=\"\"; for (i=3;i<=NF-1;i++) print \$i \" \"; print \"\n\" }' | uniq"
alias rdf-datatypes="awk -F'\x5E' '/\"\^\^</ { print substr(\$3, 2, length(\$3)-4) }' | uniq"

#alias man="unset PAGER; man"
alias grep='grep --color=auto'

alias sign='gpg --detach-sign --armor'

alias SimpleServer='open http://localhost:8000; python -m SimpleHTTPServer'

##### standard aliases (start with a space to be ignored in history)
alias ls=' exa --group-directories-first'
alias v="clear; exa --git -h -l --group-directories-first --time-style long-iso --color automatic"


alias p=' ps aux | grep'
alias g='git'
alias b='brew'
alias d=' dirs -v'
alias ka="killall"

alias dm="docker-machine"
# dms: start docker-machine if needed
function dms() {
    if [ "$(dm status ecc-dev)" == "Running" ]; then
    echo "ecc-dev running"
    eval "$(dm env ecc-dev)"
  else
    dm start ecc-dev
    dm regenerate-certs -f ecc-dev
    eval "$(dm env ecc-dev)"
  fi
}

# dmk: Kill docker-machine if necessary
function dmk() {
  if [ `dm status ecc-dev` == "Running" ]; then
    dm stop ecc-dev
  else
    echo "ecc-dev already stopped"
  fi
}

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

# http://www.commandlinefu.com/commands/view/7284/zsh-suffix-to-inform-you-about-long-command-ending
# zsh suffix to inform you about long command ending make, Just add "R" (without quotes) suffix to it and you can do other things: 
# zsh will inform you when you can see the results.
#alias -g R=' &; jobs | tail -1 | read A0 A1 A2 cmd; echo "running $cmd"; fg "$cmd"; zenity --info --text "$cmd done"; unset A0 A1 A2 cmd'

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
alias -s epub="open"
alias -s pdf="open -a Skim"
alias -s PDF="open -a Skim"
alias -s xoj="xournal"

alias -s md=" open"
alias -s markdown="open"
alias -s htm="$BROWSER"
alias -s html="$BROWSER"
alias -s jar="java -jar"
alias -s war="java -jar"
alias -s deb="sudo dpkg -i"
alias -s gpg="gpg"

alias -s iso="vlc"
alias -s avi=" open"
alias -s AVI=" open"
alias -s mov=" open"
alias -s mpg=" open"
alias -s m4v=" open"
alias -s mp4=" open"
alias -s rmvb=" open"
alias -s MP4=" open"
alias -s ogg=" open"
alias -s ogv=" open"
alias -s flv=" open"
alias -s mkv=" open"
alias -s wav=" open"
alias -s mp3=" open"
alias -s webm=" open"

alias -s tif="open"
alias -s tiff="open"
alias -s png="open"
alias -s jpg="open"
alias -s jpeg="open"
alias -s JPG="open"
alias -s gif="open"
alias -s svg="open"
alias -s psd="open"

alias -s com="open"
alias -s de="open"
alias -s org="open"

alias -s rdf="rapper --count"
alias -s owl="rapper --count"
alias -s ttl="rapper -i turtle --count"
alias -s tt="rapper -i turtle --count"
alias -s n3="rapper -i turtle --count"
alias -s nq="rapper -i nquads --count"
alias -s nt="rapper -i ntriples --count"
alias -s ntriples="rapper -i ntriples --count"
alias -s ntriple="rapper -i ntriples --count"
alias -s trig="rapper -i trig --count"

alias -s ods="open"
alias -s xls="open"
alias -s xlsx="open"
alias -s csv="vd"

alias -s pot="open"
alias -s odt="open"
alias -s doc="open"
alias -s docx="open"
alias -s rtf="open"
alias -s dot="dot -Tpng -O"

alias -s ppt="open"
alias -s pptx="open"
alias -s odp="open"

alias -s plist="plutil"
alias -s log="open"

alias -s sla="open"

alias -s exe="open"

alias -s tjp="tj3"
alias -s asc="gpg"
alias -s pem="openssl x509 -noout -text -in "
alias sourcetree='open -a SourceTree'


alias cls="clear"
alias gst="git status"
alias ga="git add "
alias gcman="git commit -am "
alias gph="git push "

alias dm='docker-machine'
alias dmx='docker-machine ssh'
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

crm()
{
	docker-compose stop $1
	docker-compose rm --force $1
}

alias cacheclear="rm -rfv ~/Library/Caches/"
alias gitpullall="ls | xargs -P10 -I{} git -C {} pull"

alias b='bundle exec'

alias ll='ls -l'
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
alias ssh='autossh -M 2000 '

function find_in { find . -name $1 -print | xargs grep --color=auto -inH $2; }
function anybar { echo -n $1 | nc -4u -w0 localhost ${2:-1738} ;}

alias mkdr='mkdir $1 &&cd ./$1'
alias cgit='cd ~/Documents/GitHub/'

