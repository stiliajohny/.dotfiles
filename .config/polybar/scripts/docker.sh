#!/bin/sh

docker_is_active="$(systemctl is-active docker)"

if [ "$docker_is_active" == "active" ]; then
	echo "%{F#3cb703}   : Active $(docker ps -f status=running | tail -n+2 | wc -l) "
else
	echo "%{F#e53935}  : Inactive"
fi


if [ "$docker_is_active" == "active" ]; then
case "$1" in

rofi-left) docker ps --format {{.Names}} | rofi -dmenu
    ;;
*) echo ""
   ;;
esac
fi
