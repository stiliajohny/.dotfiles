# Docker MOTD

See how you can customize the screen you see when you login to give you important information quickly.We can configure the Message of the Day, which is useful for displaying data to us on login. When you have a lot of servers to log into, this can be VERY handy.

The information you put here can be specific to your use case. At work, I output the customer information that's specific to the server I log into.

However we can use it to get some general information as well. Let's make a script for that. Here's the contents of a shell script I've named on_login.sh:

***Replace the disk xvda1 with your drive ( run fdisk -l )***

```
#! /usr/bin/env bash

# Basic info
HOSTNAME=`uname -n`
ROOT=`df -Ph | grep xvda1 | awk '{print $4}' | tr -d '\n'`

# System load
MEMORY1=`free -t -m | grep Total | awk '{print $3" MB";}'`
MEMORY2=`free -t -m | grep "Mem" | awk '{print $2" MB";}'`
LOAD1=`cat /proc/loadavg | awk {'print $1'}`
LOAD5=`cat /proc/loadavg | awk {'print $2'}`
LOAD15=`cat /proc/loadavg | awk {'print $3'}`

dRunning=$(docker ps -q | wc -l)
dExited=$(docker ps -aq --filter status=exited | wc -l)
dImages=$(docker images -q | wc -l)
dServices=0
#dServices=$(docker service ls -q | wc -l)

colorred="\033[31m"
colorpowder_blue="\033[1;36m" #with bold
colorblue="\033[34m"
colornormal="\033[0m"
colorwhite="\033[97m"
colorlightgrey="\033[90m"

printf "                   ${colorred} ##       ${colorlightgrey} .         \n"
printf "             ${colorred} ## ## ##      ${colorlightgrey} ==         \n"
printf "           ${colorred}## ## ## ##      ${colorlightgrey}===         \n"
printf "       /\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\\\___/ ===       \n"
printf "  ${colorblue}~~~ ${colorlightgrey}{${colorblue}~~ ~~~~ ~~~ ~~~~ ~~ ~ ${colorlightgrey}/  ===- ${colorblue}~~~${colorlightgrey}\n"
printf "       \\\______${colorwhite} o ${colorlightgrey}         __/           \n"
printf "         \\\    \\\        __/            \n"
printf "          \\\____\\\______/               \n"
printf "${colorpowder_blue}                                          \n"
printf "          |          |                    \n"
printf "       __ |  __   __ | _  __   _          \n"
printf "      /  \\\| /  \\\ /   |/  / _\\\ |     \n"
printf "      \\\__/| \\\__/ \\\__ |\\\_ \\\__  | \n"
printf " ${colornormal}                                         \n"

#! /usr/bin/env bash

# Basic info
HOSTNAME=`uname -n`
#ROOT=`df -Ph | grep xvda1 | awk '{print $4}' | tr -d '\n'`
ROOT=`df -h | head -2 | tail -1 | awk {'print$4'} `
# System load
MEMORY1=`free -t -m | grep Total | awk '{print $3" MB";}'`
MEMORY2=`free -t -m | grep "Mem" | awk '{print $2" MB";}'`
LOAD1=`cat /proc/loadavg | awk {'print $1'}`
LOAD5=`cat /proc/loadavg | awk {'print $2'}`
LOAD15=`cat /proc/loadavg | awk {'print $3'}`

dRunning=$(docker ps -q | wc -l)
dExited=$(docker ps -aq --filter status=exited | wc -l)
dImages=$(docker images -q | wc -l)
dServices=0
#dServices=$(docker service ls -q | wc -l)

colorred="\033[31m"
colorpowder_blue="\033[1;36m" #with bold
colorblue="\033[34m"
colornormal="\033[0m"
colorwhite="\033[97m"
colorlightgrey="\033[90m"



echo -e "
== ${colorblue}SYSTEM${colornormal} =============================================================
 - Hostname............: $HOSTNAME
 - Disk Space..........: $ROOT remaining

 - CPU usage...........: $LOAD1, $LOAD5, $LOAD15 (1, 5, 15 min)
 - Memory used.........: $MEMORY1 / $MEMORY2
 - Swap in use.........: `free -m | tail -n 1 | awk '{print $3}'` MB
 =======================================================================

 == ${colorblue}DOCKER STATS${colornormal} =======================================================
 - $dRunning container(s) running.
 - $dExited container(s) exited.
 - $dImages image(s).

 == ${colorblue}SWARM${colornormal} ==============================================================
 - $dServices service(s) running.
 =======================================================================

 == ${colorblue}SERVICES${colornormal} ===========================================================
 - Zabbix is:           $(if [ $(systemctl is-active  zabbix-agent) == "active" ] ; then echo -e  "\e[32m$(systemctl is-active zabbix-agent)\e[39m"; else echo -e "\e[31m\e[25m$(systemctl is-active  zabbix-agent)\e[39m" ; fi)
 - Puppet is:           $(if [ $(systemctl is-active  puppet) == "active" ] ; then echo -e  "\e[32m$(systemctl is-active  puppet)\e[39m"; else echo -e "\e[31m\e[25m$(systemctl is-active  puppet)\e[39m" ; fi)
 - Firewall is:            $(if [ $(systemctl is-active  firewalld) == "active" ] ; then echo -e  "\e[32m$(systemctl is-active  firewalld)\e[39m"; else echo -e "\e[31m\e[25m$(systemctl is-active  firewalld)\e[39m" ; fi)
 - Docker is:         $(if [ $(systemctl is-active  docker) == "active" ] ; then echo -e  "\e[32m$(systemctl is-active  docker)\e[39m"; else echo -e "\e[31m\e[25m$(systemctl is-active  docker)\e[39m" ; fi)
 - Gitlab-Runner is:     $(if [ $(systemctl is-active  gitlab-runner) == "active" ] ; then echo -e  "\e[32m$(systemctl is-active gitlab-runner)\e[39m"; else echo -e "\e[31m\e[25m$(systemctl is-active  gitlab-runner)\e[39m" ; fi)

 =======================================================================

 == ${colorblue}SECURITY${colornormal}  ==========================================================
 - SELinux is: $(getenforce)
 =======================================================================
 "

```
## Ubuntu

Ubuntu makes this pretty easy. We can simply throw the above script into the directory /etc/update-motd.d/.

sudo mv on_login.sh /etc/update-motd.d/05-info
sudo chmod +x /etc/update-motd.d/05-info

Once you log out and back in, we'll see that info!


## CentOS

CentOS takes just a little more work to setup.

We need to turn off (yes, off) SSH's PrintMotd option by editing /etc/ssh/sshd_config:

`PrintMotd no`

This stops printing from the plaintext /etc/motd and lets us print our own content.

We just need to restart sshd as so that takes affect:

`sudo service sshd restart`

Now we'll place our shell script into /etc/profile.d.

`sudo mv on_login.sh /etc/profile.d/login-info.sh`

Then once we login, we'll see the output of our script!


