# CodeWhisperer pre block. Keep at the top of this file.
[[ -f "${HOME}/Library/Application Support/codewhisperer/shell/bash_profile.pre.bash" ]] && builtin source "${HOME}/Library/Application Support/codewhisperer/shell/bash_profile.pre.bash"
[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*

# CodeWhisperer post block. Keep at the bottom of this file.
[[ -f "${HOME}/Library/Application Support/codewhisperer/shell/bash_profile.post.bash" ]] && builtin source "${HOME}/Library/Application Support/codewhisperer/shell/bash_profile.post.bash"
. "$HOME/.cargo/env"
