#!/bin/sh

echo "%{F#3cb703}   : $( vboxmanage list -s runningvms | wc -l) "
