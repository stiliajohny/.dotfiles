#!/bin/sh

echo "%{F#3cb703}   : $( vboxmanage list -s vms | wc -l) "
