zsh_terraform() {
  # check for terraform cli
  if ! command -v terraform &> /dev/null
  then
      echo "COMMAND could not be found"
      exit
  fi

  # break if there is no .terraform directory
  if [[ -d .terraform ]]; then
      local tf_workspace=$($(which terraform) workspace show)
      echo -n "(%{%F{4}%}%{%f%}|%{%F{1}%}TF%{%f%}:%{%F{6}%}$tf_workspace%{%f%})-"
  fi
}
