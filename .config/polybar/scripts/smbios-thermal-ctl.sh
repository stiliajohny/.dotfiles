#!/usr/bin/env bash
# -*- coding: None -*-

fan1=$(sensors | grep fan1 | awk {'print$2" "$3'})
fan2=$(sensors | grep fan2 | awk {'print$2" "$3'})

temp_file="/tmp/polybar_script_fan_control"

#  create a file if it doesn't exist
if [ ! -f $temp_file ]; then
    touch $temp_file
    echo "Unknown fan state"  > $temp_file
fi

function open_rofi(){
    input=$(echo -e "Custom-1.1\nCustom-2.2\nBalanced\nCool-bottom\nQuiet\nPerformance\n" |  rofi -dmenu -window-title "Thermal Control")
    #create a case statement to run the appropriate command
    case $input in
        "Custom-1.1")
            echo "Custom-1.1" >$temp_file
            sudo dell-bios-fan-control 0 > /dev/null 2>&1
            i8kfan 1 1 > /dev/null 2>&1
        ;;
        "Custom-2.2")
            echo "Custom-2.2" >$temp_file
            sudo dell-bios-fan-control 0 > /dev/null 2>&1
            i8kfan 2 2 > /dev/null 2>&1
        ;;
        "Balanced")
            echo "Balanced">$temp_file
            sudo dell-bios-fan-control 1 > /dev/null 2>&1
            sudo smbios-thermal-ctl --set-thermal-mode=balanced > /dev/null 2>&1
        ;;
        "Cool-bottom")
            sudo dell-bios-fan-control 1 > /dev/null 2>&1
            sudo smbios-thermal-ctl --set-thermal-mode=cool-bottom  > /dev/null 2>&1
            echo "Cool-bottom" >$temp_file
        ;;
        "Quiet")
            sudo dell-bios-fan-control 1 > /dev/null 2>&1
            sudo smbios-thermal-ctl --set-thermal-mode=quiet > /dev/null 2>&1
            echo "Quiet" >$temp_file
        ;;
        "Performance")
            sudo dell-bios-fan-control 1  > /dev/null 2>&1
            sudo smbios-thermal-ctl --set-thermal-mode=performance > /dev/null 2>&1
            echo "Performance" >$temp_file
        ;;
    esac
}



state=$(cat $temp_file)

case $state in
    "Custom-1.1")
        echo "%{F#ff9600}Manual Mid = 1: $fan1, 2: $fan2 %{F-}"
    ;;
    "Custom-2.2")
        echo "%{F#ff9600}Manual Fast = 1: $fan1, 2: $fan2 %{F-}"
    ;;
    "Balanced")
        echo "%{F#3cb703}Balanced = 1: $fan1, 2: $fan2 %{F-}"
    ;;
    "Cool-bottom")
        echo "%{F#3cb703}Cool-bottom = 1: $fan1, 2: $fan2 %{F-}"
    ;;
    "Quiet")
        echo "%{F#3cb703}Quiet = 1: $fan1, 2: $fan2 %{F-}"
    ;;
    "Performance")
        echo "%{F#3cb703}Performance = 1: $fan1, 2: $fan2 %{F-}"
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