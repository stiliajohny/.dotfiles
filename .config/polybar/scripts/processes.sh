#!/bin/sh

running_ps="$(ps -aux | wc -l )"

echo " PS: $running_ps "
