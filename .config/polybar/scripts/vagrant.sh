#!/bin/sh

echo "%{F#3cb703}   : $(vagrant global-status | grep  running | wc -l) "
