#!/bin/sh


# declare some colors for ourpur
red='\033[0;31m'
green='\033[0;32m'
orange='\033[0;33m'
NC='\033[0m' # No Color

# arch_icon=""
arch_icon=""

if ! updates_arch=$(checkupdates 2> /dev/null | wc -l ); then
    updates_arch=0
fi

if ! updates_aur=$(yay -Qum 2> /dev/null | wc -l); then
    updates_aur=0
fi

updates=$(("$updates_arch" + "$updates_aur"))


# create a function for checking if apps are installed
function is_app_installed {
    # check if yay in installed otherwise print an error
    if ! command -v yay > /dev/null; then
        echo "yay not installed"
    else
        echo "yay is installed"
    fi
    
    # check if pacman is installed otherwise print an error
    if ! command -v pacman > /dev/null; then
        echo "pacman not installed"
    else
        echo "pacman is installed"
    fi
    
}

# create a case statement for click left and click right
case "$1" in
    --click-left)
        if [ "$updates" -gt 0 ]; then
            echo "$arch_icon $updates"
        else
            echo "$arch_icon"
        fi
    ;;
    --click-right)
        if [ "$updates" -gt 0 ]; then
            echo "$arch_icon $updates"
        else
            echo "$arch_icon"
        fi
    ;;
    --debug)
        is_app_installed
        echo "updates_arch: $updates_arch"
        echo "updates_aur: $updates_aur"
        echo "updates: $updates"
    ;;
    *)
        if [ "$updates" -gt 0 ]; then
            echo " $arch_icon $updates"
        else
            echo "$arch_icon"
        fi
    ;;
esac