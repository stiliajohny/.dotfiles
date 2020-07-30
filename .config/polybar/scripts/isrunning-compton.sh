#!/bin/sh

case "$1" in
    --toggle)
        if [ "$(pgrep -x picom)" ]; then
            pkill picom
        else
            picom -b &
        fi
        ;;
    *)
        if [ "$(pgrep -x picom)" ]; then
            echo "# %{F#3cb703}Picom%{F-}"
        else
            echo "# %{F#e53935}No Picom%{F-}"
        fi
        ;;
esac


