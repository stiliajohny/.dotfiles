# Non LVM
Increase the size of the EBS volume from AWS console

`[ec2-user ~]$ lsblk`
NAME MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvda 202:0 0 16G 0 disk
└─xvda1 202:1 0 8G 0 part /
xvdf 202:80 0 30G 0 disk
└─xvdf1 202:81 0 8G 0 part /data

Extend the partition

`ec2-user ~]$ sudo growpart /dev/xvda 1`

Now extend the file system

`[ec2-user ~]$ sudo xfs_growfs -d /`


# LVM

`pvresize /dev/xvdf`
`lvextend /dev/esdata_vg01/esdata_vol01 /dev/xvdf`
`xfs_growfs /dev/mapper/esdata_vg01-esdata_vol01`
