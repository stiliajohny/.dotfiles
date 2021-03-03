Centos Minimal Instalation

* Basic packages to install
`yum install -y wget links 7-zip gcc java rkhunteri bash-completion yum-plugin-priorities epel-release vim-enhanced git net-tools `
`yum -y install http://pkgs.repoforge.org/rpmforge-release/rpmforge-release-0.5.3-1.el7.rf.x86_64.rpm`
`yum update && yum upgrade`

* Set Hostname
`echo $HOSTNAME`
`nmtui`

* Set Vim Options

`sudo tee -a /root/.vimrc > /dev/null <<EOT`
`set nocompatible`
`set fileformats=unix,dos`
`set history=100`
`set ignorecase`
`set number`
`set showmatch`
`syntax on`
`highlight Comment ctermfg=LightCyan`
`set wrap`
`set incsearch`
`set hlsearch`
`set smartcase`
`EOT`
