#!/bin/sh

VPNconnection=$(pgrep -a openvpn$ | head -n 1 | awk '{print $NF }' | cut -d '.' -f 1) 

if [ -z "$VPNconnection" ]
then
      status="down"
      echo  "%{F#e53935}VPN: $status%{F-}"
else
      status="$VPNconnection"
      echo  "%{F#3cb703}VPN:%{F-} $status"
fi

echo  "%{F#3cb703}VPN%{F-} $status"


#echo "%{F#3cb703}VPN%{F-} $(echo $(pgrep -a openvpn$ | head -n 1 | awk '{print $NF }' | cut -d '.' -f 1 && echo -e \\ndown) | head -n 1)"
