#!/bin/sh

HOST=8.8.8.8
reach="$(ping -n -c 1 -W 1 $HOST 2>/dev/null)"


case "$?" in
    *2*)
	echo "unreachable "
	;;
    *0*)
	    rtt=$(echo "$(ping -n -c 1 -W 1 $HOST)" | sed -rn 's/.*time=([0-9]{1,})\.?[0-9]{0,} ms.*/\1/p')
	if [ "$rtt" -lt 50 ]; then
		icon="%{F#3cb703}#%{F-}"
	elif [ "$rtt" -lt 150 ]; then
		icon="%{F#f9dd04}#%{F-}"
	else
		icon="%{F#d60606}#%{F-}"
	fi

	echo "$icon $rtt ms"
	;;
esac

