#! /bin/sh

if sessionlist=$(tmux ls); then
    printf "  |"

    echo "$sessionlist" | while read -r line; do
        session=$(echo "$line" | cut -d ':' -f 1)

        if echo "$line" | grep -q "(attached)"; then
            status="(atch)"
        else
            status=""
        fi

        printf " %s%s |" "$session" "$status"
    done

    printf "\n"
else
    printf "# none\n"
fi
