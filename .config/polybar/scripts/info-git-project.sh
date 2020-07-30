#!/bin/bash -
#title          :info-git-projects.sh
#description    :get a list of your git projects and show statistics
#author         :John Stilia
#date           :20200502
#version        :0.1
#usage          :./info-git-projects.sh
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



echo -e "%{F#3cb703} :$(~/.local/bin/mgitstatus ~/Documents/GitHub  |grep  ': ok' | wc -l )%{F-}/%{F#e53935}$(~/.local/bin/mgitstatus -e ~/Documents/GitHub | wc -l) %{F-}"
