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

GIT_FOLDER=~/Documents/GitHub/
### Check if a directory does not exist ###
#if [ ! -d "$GIT_FOLDER" ]
#then
#    exit 9999 # die with error code 9999
#fi
#if ! command -v mgitstatus &> /dev/null
#then
#	exit 9999
#fi

echo -e "%{F#3cb703} :$(~/.local/bin/mgitstatus $GIT_FOLDER  |grep  ': ok' | wc -l )%{F-}/%{F#e53935}$(~/.local/bin/mgitstatus -e $GIT_FOLDER | wc -l) %{F-}"

if [  -d "$GIT_FOLDER" ]
then
	case "$1" in
	rofi-left) cd "$GIT_FOLDER" ;  mgitstatus -e . | rofi -dmenu -window-title "Git Status " 
		;;
	*) echo ""
		;;
	esac
fi
