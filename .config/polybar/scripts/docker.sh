#!/bin/sh

docker_is_active="$(systemctl is-active docker)"

if [ "$docker_is_active" = "active" ]; then
    echo "%{F#3cb703}   : Active: $(docker images -q | wc -l) / $(docker ps -f status=running | tail -n+2 | wc -l) "
else
    echo "%{F#e53935}  : Inactive"
fi


if [ "$docker_is_active" = "active" ]; then
case "$1" in

rofi-right) docker images --format "{{.Repository}} has the following {{.ID}}" | rofi -dmenu -window-title "Existing Docker Images"
    ;;
rofi-left) docker ps --format {{.Names}} | rofi -dmenu -window-title "Running Docker Containers"
    ;;
*) echo ""
   ;;
esac
fi
