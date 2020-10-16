# Dotfiles

<h1 align="center">dotfiles ❤ ~/</h1

![](.config/wallpaper/screenshot/screen.png)

<p align="center">
    <a href="#vanila">Vanila Installl</a>&nbsp;&nbsp;&nbsp;
    <a href="https://files.dikiaap.id/img/dotfiles/dunst.png">Dunst</a>&nbsp;&nbsp;&nbsp;
    <a href="https://files.dikiaap.id/img/dotfiles/i3blocks.png">i3blocks</a>&nbsp;&nbsp;&nbsp;
    <a href="https://files.dikiaap.id/img/dotfiles/zsh.png">Zsh</a>&nbsp;&nbsp;&nbsp;
    <a href="https://files.dikiaap.id/img/dotfiles/tmux.png">tmux</a>&nbsp;&nbsp;&nbsp;
    <a href="https://files.dikiaap.id/img/dotfiles/colors.png">Colors</a>&nbsp;&nbsp;&nbsp;
    <a href="https://files.dikiaap.id/img/dotfiles/dircolors.png">dircolors</a>
</p>

# <a name="vanila"></a>Install it on vanila system

```
git clone --bare git@github.com:stiliajohny/dotfiles.git $HOME/.cfg
```

```
function config {
   /usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME $@
}
```

```
mkdir -p .config-backup
```

```
config checkout
```

```
if [ $? = 0 ]; then
  echo "Checked out config.";
else
  echo "Backing up pre-existing dot files.";
  config checkout 2>&1 | egrep "\s+\." | awk {'print $1'} | xargs -I{} mv {} .config-backup/{}
fi;
```

```
config checkout
```

```
config config status.showUntrackedFiles no
```
