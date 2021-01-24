zsh_terraform() {
  # break if there is no .terraform directory
  if [[ -d .terraform ]]; then
      local tf_workspace=$($(which terraform) workspace show)
      echo -n "(%{%F{4}%}%{%f%}|%{%F{1}%}TF%{%f%}:%{%F{6}%}$tf_workspace%{%f%})-"
  fi
}
