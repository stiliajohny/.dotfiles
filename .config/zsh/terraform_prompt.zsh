zsh_terraform() {
  # break if there is no .terraform directory
  if [[ -d .terraform ]]; then
      local tf_workspace=$($(which terraform) workspace show)
      echo -n "(TF: $tf_workspace)-"
  fi
}
