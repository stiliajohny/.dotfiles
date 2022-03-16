#!/usr/bin/env bash

# declare some colors for ourpur
RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
NC='\033[0m' # No Color
BAR_ICON=""
arch_icon=$BAR_ICON
NOTIFY_ICON=/usr/share/icons/ArchLabs-Dark/32x32/apps/system-software-update.svg

# function for checking if apps are installed
function is_app_installed {
    # check if yay in installed otherwise print an error
    if ! command -v yay > /dev/null; then
        echo -e "yay not $RED installed$NC"
    else
        echo -e "yay is $GREEN installed$NC"
    fi
    # check if pacman is installed otherwise print an error
    if ! command -v pacman > /dev/null; then
        echo -e "pacman not $RED installed$NC"
    else
        echo -e "pacman is $GREEN installed$NC"
    fi
    # check if urxvt is installed
    if ! command -v urxvt > /dev/null; then
        echo -e "urxvt $RED not installed$NC"
    else
        echo -e "urxvt is $GREEN installed$NC"
    fi
    # check if notify-send is installed
    if ! command -v notify-send > /dev/null; then
        echo -e "notify-send $RED not installed$NC"
    else
        echo -e "notify-send is $GREEN installed$NC"
    fi
}

#  get the number of updates
get_total_updates() {
    if ! updates_arch=$(checkupdates 2> /dev/null | wc -l ); then
        updates_arch=0
    fi
    if ! updates_aur=$(yay -Qum 2> /dev/null | wc -l); then
        updates_aur=0
    fi
    UPDATES=$(("$updates_arch" + "$updates_aur"))
}

# run pacman and yay updates in a function
function update_system() {
    if command -v pacman > /dev/null; then
        urxvt -e sh -c  "sudo pacman -Syyu --noconfirm"
    fi
    if command -v yay > /dev/null; then
        urxvt -e sh -c  "yay -Syyu --noconfirm"
    fi
}

#  function that check updates and notify depends on number
function check_updates_number() {
    # notify user of updates
    if hash notify-send &>/dev/null; then
        if (( UPDATES > 50 )); then
            notify-send -u critical -i $NOTIFY_ICON \
            "You really need to update!!" "$UPDATES New packages"
            elif (( UPDATES > 25 )); then
            notify-send -u normal -i $NOTIFY_ICON \
            "You should update soon" "$UPDATES New packages"
            elif (( UPDATES > 2 )); then
            notify-send -u low -i $NOTIFY_ICON \
            "$UPDATES New packages"
        fi
    fi
}

# case statement for click left and click right
case "$1" in
    --click-left)
        # run termite and execure a command
        update_system
    ;;
    --click-right)
        if [ "$UPDATES" -gt 0 ]; then
            echo -e "$arch_icon $UPDATES"
        else
            echo -e "$arch_icon No Updates"
        fi
    ;;
    --debug)
        is_app_installed
        get_total_updates
        echo -e "updates_arch: $updates_arch"
        echo -e "updates_aur: $updates_aur"
        echo -e "updates: $UPDATES"
    ;;
    --polybar)
        get_total_updates
        check_updates_number
        # if updates are more than 0 print a message otherwise just the icon
        if (( UPDATES > 0 )); then
            echo -e "$arch_icon $UPDATES"
        else
            echo -e "$arch_icon No Updates"
        fi
    ;;
    *)
        #    print help
        echo "Usage: $0 [option]"
        echo "Options:"
        echo "--click-left    Update and restart"
        echo "--click-right   Show update count"
        echo "--debug         Show debug info"
        echo "--polybar       Show update count for polybar"
    ;;
esac