#!/bin/sh
if  command -v vboxmanage &> /dev/null
then
	echo "%{F#3cb703}   : $( vboxmanage list -s runningvms | wc -l) "
elif ! command -v vboxmanage &> /dev/null
then
	echo -e "%{F#ff0000}   : N/A "
fi
