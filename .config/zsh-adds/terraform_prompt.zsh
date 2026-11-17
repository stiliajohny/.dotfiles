zsh_terraform() {
  # check for terraform cli
  if ! command -v terraform &> /dev/null
  then
      echo "COMMAND could not be found"
      return 1
  fi

  # break if there is no .terraform directory
  if [[ -d .terraform ]]; then
      local tf_workspace=$($(which terraform) workspace show)
      echo -n "(%{%F{117}%}%{%f%}|%{%F{196}%}TF%{%f%}:%{%F{51}%}$tf_workspace%{%f%})-"
  fi
}
