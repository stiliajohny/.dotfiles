#!/bin/sh
if  command -v vboxmanage &> /dev/null
then
    case "$1" in
    rofi-left) vboxmanage list -s runningvms | awk -F"{" {'print$1'}  | rofi -dmenu -window-title "Vbox Status"
    		;;
   	*) echo "%{F#3cb703}   : $( vboxmanage list -s runningvms | wc -l) "
    		;;
    	esac
elif ! command -v vboxmanage &> /dev/null
then
	echo -e "%{F#ff0000}   : N/A "
fi
