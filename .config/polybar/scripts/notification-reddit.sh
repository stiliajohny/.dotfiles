#!/bin/sh

#URL="https://www.reddit.com/message/unread/.json?feed=1dea2c611da83685ddf16f3a56573d4bfbf5e22f&user=Stiliajohny"
URL1="https://www.reddit.com/message/inbox/.json?feed=1dea2c611da83685ddf16f3a56573d4bfbf5e22f&user=Stiliajohny"
URL2="https://www.reddit.com/.json?feed=1dea2c611da83685ddf16f3a56573d4bfbf5e22f&user=Stiliajohny"
URL3="https://www.reddit.com/saved.json?feed=1dea2c611da83685ddf16f3a56573d4bfbf5e22f&user=Stiliajohny"
URL4="https://www.reddit.com/user/Stiliajohny/upvoted.json?feed=1dea2c611da83685ddf16f3a56573d4bfbf5e22f&user=Stiliajohny"
URL5="https://www.reddit.com/message/comments/.json?feed=1dea2c611da83685ddf16f3a56573d4bfbf5e22f&user=Stiliajohny"
URL6=""
USERAGENT="polybar-scripts/notification-reddit:v1.0 u/stiliajohny"

notifications1=$(curl -sf --user-agent "$USERAGENT" "$URL1" | jq '.["data"]["children"] | length')
notifications2=$(curl -sf --user-agent "$USERAGENT" "$URL2" | jq '.["data"]["children"] | length')
notifications3=$(curl -sf --user-agent "$USERAGENT" "$URL3" | jq '.["data"]["children"] | length')
notifications4=$(curl -sf --user-agent "$USERAGENT" "$URL4" | jq '.["data"]["children"] | length')
notifications5=$(curl -sf --user-agent "$USERAGENT" "$URL5" | jq '.["data"]["children"] | length')

if [ -n "$notifications" ] && [ "$notifications" -gt 0 ]; then
	echo " : IN:$notifications1 | FP:$notifications2 | SV:$notifications3 | UP:$notifications4 | CM:$notifications5 "
else
	#echo " "
	echo " : IN:$notifications1 | FP:$notifications2 | SV:$notifications3 | UP:$notifications4 | CM:$notifications5 "
fi
