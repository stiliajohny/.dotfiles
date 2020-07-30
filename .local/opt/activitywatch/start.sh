#!/bin/bash -
#title          :start.sh
#description    :
#author         :
#date           :20200503
#version        :
#usage          :./start.sh
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



cd ~/.local/opt/activitywatch         # Put your ActivityWatch install folder here

./aw-server/aw-server &
./aw-watcher-afk/aw-watcher-afk &
./aw-watcher-window/aw-watcher-window &                 # you can add --exclude-title here to exclude window title tracking for this session only

notify-send "ActivityWatch started"   # Optional, sends a notification when ActivityWatch is started
