
<h1 align="center">dotfiles ❤ ~/</h1


 <img src="https://github.com/stiliajohny/dotfiles/raw/master/.config/wallpaper/screenshot/screen.png" alt="Girl in a jacket" width="50%" height="50%">



# Install it on vanila system

1. Clone the repo

```
git clone --bare git@github.com:stiliajohny/dotfiles.git $HOME/.cfg
```

2. Apply the shell function

```
function config {
   /usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME $@
}
```

3. Create a folder for backing up files

```
mkdir -p .config-backup
```

4. Using the config command checkout the repo

```
config checkout
```

5. Copy any of the old files in the backup folder

```
if [ $? = 0 ]; then
  echo "Checked out config.";
else
  echo "Backing up pre-existing dot files.";
  config checkout 2>&1 | egrep "\s+\." | awk {'print $1'} | xargs -I{} mv {} .config-backup/{}
fi;
```
6. Re-Checkout  to download all files

```
config checkout
```
7. Exclude untrucked files
```
config config status.showUntrackedFiles no
```
