fan1=$(sensors | grep fan1 | awk {'print$2" "$3'})
fan2=$(sensors | grep fan2 | awk {'print$2" "$3'})

echo -e "1: $fan1, 2: $fan2" 
