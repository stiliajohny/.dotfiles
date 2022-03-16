#!/usr/bin/env bash
# -*- coding: None -*-

temp_file="/tmp/polybar_smbios-battery-ctl"

#  create file if it doesn't exist
if [ ! -f $temp_file ]; then
    touch $temp_file
    echo "Unknown battery state"  > $temp_file
fi

function open_rofi(){
    input=$(echo -e 'primarily_ac\nadaptive\nstandard\nexpress' |  rofi -dmenu -window-title "Battery Control")
    #create a case statement to run the appropriate command
    case $input in
        "primarily_ac")
            echo "AC" > "$temp_file"
            sudo smbios-battery-ctl --set-charging-mode=$input > /dev/null 2>&1
        ;;
        "adaptive")
            echo "adaptive"> "$temp_file"
            sudo smbios-battery-ctl --set-charging-mode=$input > /dev/null 2>&1
        ;;
        "standard")
            echo "standard" > "$temp_file"
            sudo smbios-battery-ctl --set-charging-mode=$input > /dev/null 2>&1
        ;;
        "express")
            echo "express" > "$temp_file"
            sudo smbios-battery-ctl --set-charging-mode=$input > /dev/null 2>&1
        ;;
    esac
}


state=$(cat $temp_file)

case $state in
    "AC")
        echo " %{F#FFFF00}AC%{F-}"
    ;;
    "adaptive")
        echo " %{F#ff00ff}Adaptive%{F-}"
    ;;
    "standard")
        echo " %{F#00ff00}Standard%{F-}"
    ;;
    "express")
        echo " %{F#ff9600}Express%{F-}"
    ;;
    *)
        cat $temp_file
    ;;
esac

# create a case statement to choose between left and right
case $1 in
    right)
        echo "Right"
    ;;
    left)
        open_rofi
    ;;
esac
