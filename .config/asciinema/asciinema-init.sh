#!/bin/bash -
#title          :asciinema-init.sh
#description    :init the asciinema app
#author         :
#date           :20200513
#version        :
#usage          :./asciinema-init.sh
#notes          :
#bash_version   :5.0.16(1)-release
#============================================================================



# ----------------------------------
# Colors
# ----------------------------------
NOCOLOR='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
LIGHTGRAY='\033[0;37m'
DARKGRAY='\033[1;30m'
LIGHTRED='\033[1;31m'
LIGHTGREEN='\033[1;32m'
YELLOW='\033[1;33m'
LIGHTBLUE='\033[1;34m'
LIGHTPURPLE='\033[1;35m'
LIGHTCYAN='\033[1;36m'
WHITE='\033[1;37m'

# example ${BLUE}example text${NOCOLOR}

if ! [ -x "$(command -v asciinema)" ]; then
  echo 'Error: git is not installed.' >&2
  exit 1
fi
FILE=~/.config/asciinema/install-id
if [ -f "$FILE" ]; then
    echo "Auth File \"$FILE\" exist"
else 
    echo "$FILE does not exist"
fi

if [ "$TERM" = "screen" ] && [ -n "$TMUX" ]; then
  tmux_first_session=$(tmux list-sessions | head -1 | awk -F":" {'print$1'})
else
  echo -e "${RED}No tmux version available${NOCOLOR}"
fi


cd ~/.config/asciinema
echo $tmux_first_session
notify-send -u low -a Asciinema "Start Recording \nTmux session: $tmux_first_session"
asciinema rec -c "tmux attach -t $tmux_first_session" $(date +%FT%T%Z)
#ascinnema rec $(date +%FT%T%Z)
