<h1 align="center">dotfiles ❤ ~/</h1>


Apply dotfiles with native `git bare`
Index
* [Starting from scratch](#fromscratch)
* [Install into new system](#newsystem)
* [Install it on on vanila system](#vanila)
* [Photos](photos)


# <a name="fromscratch"></a>Starting from scratch


`git init --bare $HOME/.cfgalias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'`

`"alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'" >> $HOME/.bashrc`

`config config --local status.showUntrackedFiles noecho`

---

### How to use it
`config status`

`config add .vimrc`

`config commit -m "Add vimrc"`

`config add .bashrc`

`config commit -m "Add bashrc"`

`config push`

---

# <a name="newsystem"></a>Install your dotfiles onto a new system (or migrate to this setup)

* Prior to the installation make sure you have committed the alias to your `.bashrc` or `.zsh`:

`alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'`

* And that your source repository ignores the folder where you'll clone it, so that you don't create weird recursion problems:

`echo ".cfg" >> .gitignore`

* Now clone your dotfiles into a [bare](http://www.saintsjd.com/2011/01/what-is-a-bare-git-repository/) repository in a "_dot_" folder of your `$HOME`:

`git clone --bare git@github.com:stiliajohny/dotfiles.git $HOME/.cfg `

* Define the alias in the current shell scope:

`alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'`

* Checkout the actual content from the bare repository to your `$HOME`:

`config checkout`

* The step above might fail with a message like:

```
error: The following untracked working tree files would be overwritten by checkout:
.bashrc
gitignore
Please move or remove them before you can switch branches.Aborting
```
* This is because your `$HOME` folder might already have some stock configuration files which would be overwritten by Git.
    The solution is simple:
    * back up the files if you care about them,
    * remove them if you don't care. I provide you with a possible rough shortcut to move all the offending files automatically to a backup folder:

`mkdir -p .config-backup`

`config checkout 2>&1 | egrep "\s+\." | awk {'print $1'} | \xargs -I{} mv {} .config-backup/{}`

* Re-run the check out if you had problems:

`config checkout`

* Set the flag `showUntrackedFiles` to `no` on this specific (local) repository:

`config config --local status.showUntrackedFiles no`

* You're done, from now on you can now type `config` commands to add and update your dotfiles:

`config status`

`config add .vimrc`

`config commit -m "Add vimrc"`

`config add .bashrc`

`config commit -m "Add bashrc"config push`


# <a name="vanila"></a>Install it on vanila system



---
---

For completeness this is what I ended up with (tested on many freshly minted [Alpine Linux](http://www.alpinelinux.org/) containers to test it out):

```
git clone --bare git@github.com:stiliajohny/dotfiles.git $HOME/.cfg
function config {
   /usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME $@
}
mkdir -p .config-backup
config checkout
if [ $? = 0 ]; then
  echo "Checked out config.";
else
  echo "Backing up pre-existing dot files.";
  config checkout 2>&1 | egrep "\s+\." | awk {'print $1'} | xargs -I{} mv {} .config-backup/{}
fi;
config checkout
config config status.showUntrackedFiles no
```
