#!/bin/bash


# This script is used to take a screenshot of the current screen.
# REPLACE
# rofi -dmenu -window-title
# with
# dmenu -i -p

directory="$HOME/Pictures/Screenshots"
video_directory="$HOME/Videos/Screencasts"
temp="$HOME/.cache/screen.mp4"
[ ! -d "$directory" ] && mkdir -p "$directory"
[ ! -d "$video_directory" ] && mkdir -p "$video_directory"



function menu_callback {
    [ -f "$temp" ] && case "$(echo -e "yes\nno" |   rofi -dmenu -window-title  "Stop recording")" in
        "yes") killall --user $USER --ignore-case --signal SIGTERM  ffmpeg && \
            mv "$temp" "$video_directory/screencast-$(date).mp4" && \
            notify-send -i video-x-generic "Screencast saved" "Saved to $video_directory/screencast-$(date).mp4"
        ;;
        *) ;;
        esac || case "$(echo -e " full screen\n  select window\n壘  screencast\n壘    screencast (select)\n壘  screencast with audio\n壘    screencast with audio (select)\n" |  rofi -dmenu -window-title  "Snappy")" in
        " full screen") sleep 0.5s; scrot "$directory/$(date).png" ;;
        "  select window") scrot -s "$directory/$(date)-window.png" ;;
        "壘  screencast") ffmpeg -f x11grab  -framerate 25 -i $DISPLAY -c:v libx264 -preset ultrafast -c:a aac "$temp" > /dev/null 2>&1 & ;;
        "壘    screencast (select)") ret="$(xrectsel)" && ffmpeg -f x11grab  -framerate 25 $ret -c:v libx264 -preset ultrafast -c:a aac "$temp" > /dev/null 2>&1 & ;;
        "壘  screencast with audio") ffmpeg -f x11grab  -framerate 25 -i $DISPLAY -f pulse -i default -c:v libx264 -preset ultrafast -c:a aac "$temp" > /dev/null 2>&1 & ;;
        "壘    screencast with audio (select)") ret="$(xrectsel)" && ffmpeg -f x11grab  -framerate 25 $ret -f pulse -i default -c:v libx264 -preset ultrafast -c:a aac "$temp" > /dev/null 2>&1 & ;;
        *) ;;
    esac
}

function recording_check() {
    if [ -f "$temp" ]; then
        echo "%{F#ff0000}  "
    else
        echo "%{F#3cb703}  "
    fi
}


case "$1" in
    rofi-left) menu_callback
    ;;
    *) echo "$(recording_check)"
esac
