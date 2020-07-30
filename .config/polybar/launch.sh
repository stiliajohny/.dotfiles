#!/bin/sh

# Terminate already running bar instances
killall -q polybar

# Wait until the processes have been shut down
#while pgrep -u $UID -x polybar >/dev/null; do sleep 1; done
#for m in $(polybar --list-monitors | cut -d":" -f1); do
#	MONITOR=$m polybar top &
#	polybar bottom &
#	polybar dp11 &
#	polybar dp12
#done

# Launch bar1 and bar2
#echo "--- $(date)" #| tee -a /tmp/polybar1.log /tmp/polybar2.log
#polybar top & #>>/tmp/polybar1.log 2>&1 &
#polybar bottom& # >>/tmp/polybar2.log 2>&1 &

#echo "Bars launched..."
if type "xrandr"; then
	for m in $(xrandr --query | grep " connected" | cut -d" " -f1); do
		MONITOR=$m polybar --reload top &#>>/tmp/polybar1.log 2>&1 &
		MONITOR=$m        polybar --reload bottom &#>>/tmp/polybar2.log 2>&1 &
	done
else
	polybar --reload example &
fi
