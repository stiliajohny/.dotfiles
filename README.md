# dotfiles ❤ ~/</h1

![](.config/wallpaper/screenshot/screen.png)

## Install it on vanila system

```bash
git clone --bare git@github.com:stiliajohny/dotfiles.git $HOME/.cfg
```

```bash
function config {
   /usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME $@
}
```

```bash
mkdir -p .config-backup
```

```bash
config checkout
```

```bash
if [ $? = 0 ]; then
  echo "Checked out config.";
else
  echo "Backing up pre-existing dot files.";
  config checkout 2>&1 | egrep "\s+\." | awk {'print $1'} | xargs -I{} mv {} .config-backup/{}
fi;
```

```bash
config checkout
```

```bash
config config status.showUntrackedFiles no
```

## Manual steps to automate later

- `git clone https://github.com/zsh-users/zsh-history-substring-search ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-history-substring-search`
- `git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions`
- `git clone https://github.com/chrissicool/zsh-256color ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-256color`
- `git clone https://github.com/sobolevn/wakatime-zsh-plugin.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/wakatime`
- `git clone https://github.com/zsh-users/zsh-completions ${ZSH_CUSTOM:-${ZSH:-~/.oh-my-zsh}/custom}/plugins/zsh-completions`

## Apps Installed

### Security and VPN

<details>
<summary>Click to expand</summary>

- AdGuard VPN
- Little Snitch
- NordVPN
- Pareto Security
- VPN by Google One

</details>

### Creative and Design Tools

<details>
<summary>Click to expand</summary>

- Adobe Acrobat DC
- Adobe After Effects (2022, 2023)
- Adobe Bridge 2024
- Adobe Illustrator 2023
- Adobe Lightroom Classic
- Adobe Media Encoder 2023
- Adobe Photoshop 2024
- Adobe Premiere Pro (2022, 2023)
- Blender
- GIMP
- Maxon Cinema 4D R25
- Perfectly Clear Workbench
- Silhouette Studio
- UltiMaker Cura

</details>

### Productivity and Office

<details>
<summary>Click to expand</summary>

- Alfred 5
- Amphetamine
- Cyberduck
- DevPod
- Discord
- Dropbox
- Evernote
- Google Docs
- Google Drive
- Google Sheets
- Google Slides
- Keybase
- Microsoft Office Suite
- Notion
- Obsidian
- OneDrive
- OneNote
- OpenLens
- OrbStack
- Postman
- Slack
- SoundWaves
- Spotify
- TeX
- TestFlight
- Trello
- Visual Studio Code
- WakaTime
- WhatsApp Web
- draw.io

</details>

### Development and Programming

<details>
<summary>Click to expand</summary>

- Android Studio
- AppCleaner
- Arduino (IDE, app)
- DBeaver
- Docker
- GitKraken
- IntelliJ IDEA
- iTerm
- pgAdmin 4
- Processing
- PrusaSlicer
- PyCharm
- Raspberry Pi Imager
- SEGGER
- SQLiteFlow
- Sublime Text
- Unity
- Xcode-beta
- balenaEtcher

</details>

### System Utilities

<details>
<summary>Click to expand</summary>

- AlDente
- AppCleaner
- Bartender 5
- Bitwarden
- CleanMyMac X
- CubicSDR
- DisplayLink Manager
- DisplayLink Software Uninstaller
- GeekTool
- Gqrx
- Gyroflow
- HandBrake
- Hyper
- Macs Fan Control
- Micro Snitch
- NoSleep
- OBS
- Ollama
- OneMenu
- Parallels Desktop (Activation Tool, app)
- ProcessMonitor
- RAR Extractor
- Rancher Desktop
- ReiKey
- SDRangel
- SF Symbols
- Sequel Ace
- SiteSucker
- Steam (Link, app)
- TeamViewer
- The Unarchiver
- Transporter
- Utilities
- VLC
- VMware Fusion
- VNC Viewer
- XQuartz
- xbar

</details>

### Entertainment and Media

<details>
<summary>Click to expand</summary>

- GarageBand
- GoPro Webcam
- Netflix
- Plex
- Steam
- Unsplash Wallpapers

</details>

### Others

<details>
<summary>Click to expand</summary>

- Elgato Stream Deck
- Fig
- Firefox
- Safari
- uTorrent Web

</details>
