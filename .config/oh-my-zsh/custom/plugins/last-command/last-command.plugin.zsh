# Function to print the last command
print_last_command() {
    echo "Last command: $1"
}

# Add a Zsh hook to call the function after each command
autoload -U add-zsh-hook
add-zsh-hook preexec print_last_command
