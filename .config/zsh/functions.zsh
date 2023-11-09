# Functions and key bindings to that functions

function aws-env() {
    # emulate -LR zsh
    profile=${1:-default}
    echo $profile
    if [[ ${profile} == clear ]]; then
        unset AWS_ACCESS_KEY_ID
        unset AWS_SECRET_ACCESS_KEY
        unset AWS_SESSION_TOKEN
        unset AWS_SECRET_KEY
    else
        export AWS_ACCESS_KEY_ID="$(aws configure get aws_access_key_id --profile ${profile})" || return 1
        export AWS_SECRET_ACCESS_KEY="$(aws configure get aws_secret_access_key --profile ${profile})" || return 1
        export AWS_SESSION_TOKEN="$(aws configure get aws_session_token --profile ${profile})" || return 1
        export AWS_SECRET_KEY=${AWS_SECRET_ACCESS_KEY}
        env | grep AWS_ | sort
    fi
}
function terrafile-ssh_agent() {
    eval "$(ssh-agent -s)" # start the ssh agent if not already running
    ssh-add ~/.ssh/id_rsa # example key name
    terrafile install # use terrafile
}
function centos_test_docker() {
    XSOCK=/tmp/.X11-unix
    XAUTH=$(mktemp /tmp/dockergui_tmp.XXXX.xauth)

    xauth nlist $DISPLAY | sed -e 's/^..../ffff/' | xauth -f $XAUTH nmerge -
    chmod 666 $XAUTH
    #chown -Rh  root $XAUTH
    mkdir -p $HOME/docker-shared

    docker run -it --rm \
        --cap-add=SYS_PTRACE \
        -e DISPLAY=$DISPLAY \
        -e XAUTHORITY=$XAUTH \
        -v /tmp/.X11-unix/:/tmp/.X11-unix \
        -v $XAUTH:$XAUTH \
        --name centos \
        --hostname centos \
        -v $HOME/docker-shared:/home centos\
        /bin/bash -c "yum -y -q update; yum "
    /bin/rm $XAUTH
}
function kali_test_docker() {
    XSOCK=/tmp/.X11-unix
    XAUTH=$(mktemp /tmp/dockergui_tmp.XXXX.xauth)

    xauth nlist $DISPLAY | sed -e 's/^..../ffff/' | xauth -f $XAUTH nmerge -
    chmod 666 $XAUTH
    #chown -Rh  root $XAUTH
    mkdir -p $HOME/docker-shared

    docker run -it --rm \
        --cap-add=SYS_PTRACE \
        -e DISPLAY=$DISPLAY \
        -e XAUTHORITY=$XAUTH \
        -v /tmp/.X11-unix/:/tmp/.X11-unix \
        -v $XAUTH:$XAUTH \
        --name kalilinux-kali\
        --hostname kalilinux-kali\
        -v $HOME/docker-shared:/home kalilinux/kali-rolling \
        /bin/bash -c "export DEBIAN_FRONTEND=noninteractive ; apt update; apt dist-upgrade -y ; apt autoremove -y ; apt clean -y ;apt install kali-tools-top10 -y; /bin/bash"
    /bin/rm $XAUTH
}
function acp() {
  git add .
  git commit -m "$1"
  git push
}
function usesamlauth() {
  local _args
  local _cmd
  _cmd="samlauth $*"
  CREDS="$( samlauth $* )"
  if [ $? -eq 0 ]; then
    eval "${CREDS}"
  else
    echo "Error assuming auth with saml" >&2
  fi
}
memtop() {
    ps -eorss,args | sort -nr | pr -TW$COLUMNS | head
}
tmux-hglog() {
    tmux kill-pane -t 1
    tmux split-window -h -l 40 "while true; do clear; date; echo; hg xlog-small -l 5 || exit; sleep 600; done;"
    tmux select-pane -t 0
}
tmux-neww-in-cwd() {
    SIP=$(tmux display-message -p "#S:#I:#P")

    PTY=$(tmux server-info |
    egrep flags=\|bytes |
    awk '/windows/ { s = $2 }
    /references/ { i = $1 }
    /bytes/ { print s i $1 $2 } ' |
    grep "$SIP" |
    cut -d: -f4)

    PTS=${PTY#/dev/}

    PID=$(ps -eao pid,tty,command --forest | awk '$2 == "'$PTS'" {print $1; exit}')

    DIR=$(readlink /proc/$PID/cwd)

    tmux neww "cd '$DIR'; $SHELL"
}
etb() {
	l=$(tar tf $1);
	if [ $(echo "$l" | wc -l) -eq $(echo "$l" | grep $(echo "$l" | head -n1) | wc -l) ];
	then tar xf $1;
	else mkdir ${1%.t(ar.gz||ar.bz2||gz||bz||ar)} && tar xvf $1 -C ${1%.t(ar.gz||ar.bz2||gz||bz||ar)};
	fi ;
}
function newest () {
    find . -type f -printf '%TY-%Tm-%Td %TT %p\n' | grep -v cache | grep -v ".hg" | grep -v ".git" | sort -r | less
}
buf () {
    oldname=$1;
    if [ "$oldname" != "" ]; then
        datepart=$(date +%Y-%m-%d);
        firstpart=`echo $oldname | cut -d "." -f 1`;
        newname=`echo $oldname | sed s/$firstpart/$firstpart.$datepart/`;
        cp -R ${oldname} ${newname};
    fi
}
dobz2 () {
    name=$1;
    if [ "$name" != "" ]; then
        tar cvjf $1.tar.bz2 $1
    fi
}
atomtitles () {
    curl --silent $1 | xmlstarlet sel -N atom="http://www.w3.org/2005/Atom" -t -m /atom:feed/atom:entry -v atom:title -n
}
function printHookFunctions () {
    print -C 1 ":::pwd_functions:" $chpwd_functions
    print -C 1 ":::periodic_functions:" $periodic_functions
    print -C 1 ":::precmd_functions:" $precmd_functions
    print -C 1 ":::preexec_functions:" $preexec_functions
    print -C 1 ":::zshaddhistory_functions:" $zshaddhistory_functions
    print -C 1 ":::zshexit_functions:" $zshexit_functions
}
r() {
    local f
    f=(~/.config/zsh/functions.d/*(.))
    unfunction $f:t 2> /dev/null
    autoload -U $f:t
}
function webcam () {
    mplayer tv:// -tv driver=v4l2:device=/dev/video0:width=1280:height=720:fps=30:outfmt=yuy2 -vf mirror -fps 30
}
function clock () {
    while sleep 1;
    do
        tput sc
        tput cup 0 $(($(tput cols)-29))
        date
        tput rc
    done &
}
shebang() {
    if i=$(which $1);
    then
        printf '#!/usr/bin/env %s\n\n' $1 > $2 && chmod 755 $2 && vim + $2 && chmod 755 $2;
    else
        echo "'which' could not find $1, is it in your \$PATH?";
    fi;
    # in case the new script is in path, this throw out the command hash table and
    # start over  (man zshbuiltins)
    rehash
}
git-out() {
    for i in $(git push -n $* 2>&1 | awk '$1 ~ /[a-f0-9]+\.\.[a-f0-9]+/ { print $1; }')
    do
        git xlog $i
    done
}
function find_in() {
    find . -name $1 -print | xargs grep --color=auto -inH $2;
}
function crm() {
        docker-compose stop $1
        docker-compose rm --force $1
}
function alert() {
        current_volume="$(pamixer --get-volume)"
        need_volume="70"
        pactl set-sink-volume 0 $need_volume%
        paplay ~/.config/dunst/normal.wav
        pactl set-sink-volume 0 $current_volume
}
wgetod() {
    NSLASH="$(echo "$1" | perl -pe 's|.*://[^/]+(.*?)/?$|\1|' | grep -o / | wc -l)"
    NCUT=$((NSLASH > 0 ? NSLASH-1 : 0))
    wget -r -nH --user-agent=Mozilla/5.0 --cut-dirs=$NCUT --no-parent --reject="index.html*" "$1"
}
function wiki_dig() {
    dig +short txt $1.wp.dg.cx
}
function docker-volume-container() {
    docker ps -a --format '{{ .ID }}' | xargs -I {} docker inspect -f '{{ .Name }}{{ printf "\n" }}{{ range .Mounts }}{{ printf "\n\t" }}{{ .Type }} {{ if eq .Type "bind" }}{{ .Source }}{{ end }}{{ .Name }} => {{ .Destination }}{{ end }}{{ printf "\n" }}' {}
}
function docker-get-all-ip() {
    docker inspect --format "{{ .NetworkSettings.IPAddress }}" $(docker ps -q)
}
function docker-update-all() {
    docker images --format "{{.Repository}}:{{.Tag}}" | grep ':latest' | xargs -L1 docker pull
}


function yt-mp3 () {
    youtube-dl --ignore-errors -f bestaudio --extract-audio --audio-format mp3 --audio-quality 0 -o '%(title)s.%(ext)s' "$1"
}

function yt-mp3p () {
    youtube-dl --ignore-errors --sleep-interval 30 -i -f bestaudio --extract-audio --audio-format mp3 --audio-quality 0 -o '%(playlist)s/%(playlist_index)s - %(title)s.%(ext)s' "$1"
}

function  yt-dlv () {
    youtube-dl --ignore-errors -o '%(title)s.%(ext)s' "$1"
}

function  yt-dlp () {
    youtube-dl --yes-playlist --ignore-errors --sleep-interval 30 -o '%(playlist)s/%(title)s.%(ext)s' "$1"
}
# check your weather putting city as parameter
function weather() {
  curl "https://v2.wttr.in/$1"
}

# cheat-sheet in terminal
function cheatsheet() {
  curl "https://cht.sh/$1"
}

# List all npm global packages
function npm-global-variables() {
  npm list -g --depth 0
}

# Check my local IP
function localip() {
  ifconfig -l | xargs -n1 ipconfig getifaddr
}

# Check my external IP
function publicip()
{
  curl -s https://api.ipify.org && echo
}

# Upgrade everything
function upgrade-everything()
{
  echo "\033[1;32m┌──────────────────────────────────────────────────────────────────────────┐"
  echo "│ Upgrading plugins, packages and scripts to latest versions:              │"
  echo "│ 🟢 OhMyZsh                                                               │"
  echo "│ 🟢 zplug                                                                 │"
  echo "│ 🟢 Homebrew                                                              │"
  echo "│ 🟢 npm                                                                   │"
  echo "│ 🟢 pnpm                                                                  │"
  echo "│ 🟢 ncu                                                                   │"
  echo "│ 🟢 Fig                                                                   │"
  echo "└──────────────────────────────────────────────────────────────────────────┘"
  echo "┌──────────────────────────────────────────────────────────────────────────┐"
  echo "│ 🟡 OhMyZsh - Framework for managing zsh configuration                    │"
  echo "│ ⏳ OhMyZsh - Updating...                                                 │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│                                                                          │"
  omz update
  echo "\033[1;32m│                                                                          │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│ ✅ OhMyZsh - Done!                                                       │"
  echo "└──────────────────────────────────────────────────────────────────────────┘"
  echo "┌──────────────────────────────────────────────────────────────────────────┐"
  echo "│ 🟡 zplug - Next-generation plugin manager for zsh                        │"
  echo "│ ⏳ zplug - Updating...                                                   │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│                                                                          │"
  zplug update
  echo "\033[1;32m│                                                                          │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│ ✅ zplug - Done!                                                         │"
  echo "└──────────────────────────────────────────────────────────────────────────┘"
  echo "┌──────────────────────────────────────────────────────────────────────────┐"
  echo "│ 🟡 Homebrew - The missing package manager for macOS                      │"
  echo "│ ⏳ Homebrew - Updating...                                                │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│                                                                          │"
  brew upgrade && brew cleanup
  echo "\033[1;32m│                                                                          │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│ ✅ Homebrew - Done!                                                      │"
  echo "└──────────────────────────────────────────────────────────────────────────┘"
  echo "┌──────────────────────────────────────────────────────────────────────────┐"
  echo "│ 🟡 npm - Package manager for JavaScript                                  │"
  echo "│ ⏳ npm - Updating...                                                     │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│                                                                          │"
  npm install -g npm@latest
  echo "\033[1;32m│                                                                          │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│ ✅ npm - Done!                                                           │"
  echo "└──────────────────────────────────────────────────────────────────────────┘"
  echo "┌──────────────────────────────────────────────────────────────────────────┐"
  echo "│ 🟡 pnpm - Package manager for JavaScript                                 │"
  echo "│ ⏳ pnpm - Updating...                                                    │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│                                                                          │"
  npm install -g pnpm@latest
  echo "\033[1;32m│                                                                          │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│ ✅ pnpm - Done!                                                          │"
  echo "└──────────────────────────────────────────────────────────────────────────┘"
  echo "┌──────────────────────────────────────────────────────────────────────────┐"
  echo "│ 🟡 ncu - Easy upgrades dependencies to the latest versions              │"
  echo "│ ⏳ ncu - Updating...                                                     │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│                                                                          │"
  npm install -g npm-check-updates@latest
  echo "\033[1;32m│                                                                          │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│ ✅ ncu - Done!                                                           │"
  echo "└──────────────────────────────────────────────────────────────────────────┘"
  echo "┌──────────────────────────────────────────────────────────────────────────┐"
  echo "│ 🟡 Fig - Visual autocomplete to any CLI tool or script in your Terminal  │"
  echo "│ ⏳ Fig - Updating...                                                     │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│                                                                          │"
  fig update
  echo "\033[1;32m│                                                                          │"
  echo "├──────────────────────────────────────────────────────────────────────────┤"
  echo "│ ✅ Fig - Done!                                                           │"
  echo "└──────────────────────────────────────────────────────────────────────────┘"
  echo "┌──────────────────────────────────────────────────────────────────────────┐"
  echo "│                                                                          │"
  echo "│ ✅ Upgrading all scripts and packages done!                              │"
  echo "│                                                                          │"
  echo "│ Type: commands in your terminal to learn some more.                      │"
  echo "│                                                                          │"
  echo "└──────────────────────────────────────────────────────────────────────────┘"
}

# testcolors
alias testcolors1="curl -s https://gist.githubusercontent.com/WoLpH/8b6f697ecc06318004728b8c0127d9b3/raw/colortest.py | python3 "
alias testcolors2="for code ({000..255}) print -P -- "$code: %F{$code}This is how your text would look like%f""

function commands() {
  echo "\033[0;91m ============== ALL COMMANDS AVAILABLE =============="
  echo "weather [city]         - Check weather"
  echo "cheatsheet [command]   - cheatsheet online"
  echo "npm-global-variables   - Check NPM global variables"
  echo "glances                - Process manager"
  echo "neofetch               - Hardware summary"
  echo "localip                - Check local IP"
  echo "publicip               - Check public IP"
  echo "alias                  - Check all aliases"
  echo "zsh_stats              - Get a list of the top 20 commands and how many times they have been run."
  echo "config [command]       - Manage .dotfiles"
  echo "testcolors1            - Test colors #1"
  echo "testcolors2            - Test colors #2"
  echo "upgrade-everything     - Upgrade all scripts and packages to latest versions:"
  echo "                       - (omz update)"
  echo "                       - (zplug update)"
  echo "                       - (brew upgrade)"
  echo "                       - (npm install -g npm@latest)"
  echo "                       - (npm install -g npm-check-updates@latest)"
  echo "ncu -i --format group  - Group packages to update"
  echo "\033[0;91m ===================================================="
}
