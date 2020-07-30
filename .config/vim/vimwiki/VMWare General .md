# VMware


# Mount Folders 
- From cmd `sudo vmhgfs-fuse .host:/ /mnt/hgfs/ -o allow_other -o uid=1000`
- On fstab `.host:/{shared-folder} /{path-to-mount-on} vmhgfs defaults,ttl=5,uid=1000,gid=1000   0 0`

# VMware Tools 
### Install the necessary prerequisites
`yum install perl gcc make kernel-headers kernel-devel -y`

### Attach VMware tools from vSphere client.
### Mount the VMware tools package into /mnt
`mount /dev/cdrom /mnt`
`mount: /dev/sr0 is write-protected, mounting read-only`

### Copy VMware tool into the /tmp directory
`cd /mnt`
`cp VMwareTools-5.5.0-xxxxxx.tar.gz /tmp`

### Go into the /tmp directory and extract the VMware tools package
`cd /tmp`
`tar xzvf VMwareTools-5.5.0-xxxxxx.tar.gz`

### cd into the extracted folder, vmware-tools-distrib
`cd vmware-tools-distrib`

### Run vmware-install.pl to start the installation
`./vmware-install.pl`


###  FAQ

/etc/init.d/vmware start 

