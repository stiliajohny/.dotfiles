# Information-dense custom Zsh prompt.
# Blues use 256-color 117 (#87d7ff). Named `blue` is navy and disappears on black.

autoload -Uz vcs_info
zmodload zsh/datetime
setopt prompt_subst

# Soft steel frame and gray labels. Values keep their own colors.
# Nothing in PS1 or PS2 is bold. Right-side notes are a quieter grey.
typeset -g CUSTOM_PROMPT_FRAME='%F{67}'
typeset -g CUSTOM_PROMPT_LABEL='%F{245}'
typeset -g CUSTOM_PROMPT_DIM='%F{240}'
typeset -g CUSTOM_PROMPT_GHOST='%F{242}'
# Inserted into prompt text so a literal $ or backtick survives prompt_subst.
typeset -g CUSTOM_PROMPT_DOLLAR='$'
typeset -g CUSTOM_PROMPT_BACKTICK='`'

# Git branch and in-progress action. Avoid a full dirty-tree scan on every
# prompt; it added noticeable latency in large work repositories.
# Branch sits on the input line, after the path.
zstyle ':vcs_info:git:*' check-for-changes false
# Short hash only. This is one rev-parse, not a dirty-tree scan.
zstyle ':vcs_info:git:*' get-revision true
zstyle ':vcs_info:git:*' formats ' %F{240}·%f %F{139}%b%f' '%7.7i'
zstyle ':vcs_info:git:*' actionformats ' %F{240}·%f %F{139}%b|%a%f' '%7.7i'

typeset -g CUSTOM_PROMPT_STATUS='%F{green}✓%f'
typeset -g CUSTOM_PROMPT_DURATION='%F{117}ready%f'
typeset -g CUSTOM_PROMPT_CONTEXT
typeset -g CUSTOM_PROMPT_CONTEXT_LINE
typeset -g CUSTOM_PROMPT_CONTEXT_RIGHT
typeset -g CUSTOM_PROMPT_ROOT
typeset -g CUSTOM_PROMPT_SCAN_PWD
typeset -g CUSTOM_PROMPT_PY_DIR
typeset -g CUSTOM_PROMPT_TF_DIR
typeset -g CUSTOM_PROMPT_NODE_DIR
typeset -g CUSTOM_PROMPT_NODE_PIN_FILE
typeset -g CUSTOM_PROMPT_NODE_VERSION
typeset -g CUSTOM_PROMPT_NODE_BIN
typeset -g CUSTOM_PROMPT_SERVICES='%F{white}services:checking%f'
typeset -g CUSTOM_PROMPT_COMPOSE
typeset -g CUSTOM_PROMPT_COMPOSE_LINE
typeset -g CUSTOM_PROMPT_COMPOSE_RIGHT
typeset -g CUSTOM_PROMPT_COMPOSE_DIR
typeset -g CUSTOM_PROMPT_KUBE='%F{white}checking%f'
typeset -g CUSTOM_PROMPT_KUBE_RIGHT
typeset -g CUSTOM_PROMPT_GITOPS
typeset -g CUSTOM_PROMPT_GITOPS_LINE
typeset -g CUSTOM_PROMPT_GITOPS_RIGHT
typeset -g CUSTOM_PROMPT_SERVICES_RIGHT
typeset -g CUSTOM_PROMPT_SYSTEM='%F{white}system:checking%f'
typeset -g CUSTOM_PROMPT_SYSTEM_RIGHT
typeset -g CUSTOM_PROMPT_RENDERED
typeset -gi CUSTOM_PROMPT_VISIBLE_LENGTH=0
typeset -g CUSTOM_PROMPT_EXTERNAL_IP='unavailable'
typeset -gF CUSTOM_PROMPT_COMMAND_START=0
typeset -gF CUSTOM_PROMPT_SERVICES_REFRESHED=0
typeset -gF CUSTOM_PROMPT_COMPOSE_REFRESHED=0
typeset -gF CUSTOM_PROMPT_KUBE_REFRESHED=0
typeset -gF CUSTOM_PROMPT_GITOPS_REFRESHED=0
typeset -gF CUSTOM_PROMPT_SYSTEM_REFRESHED=0
typeset -gF CUSTOM_PROMPT_EXTERNAL_IP_REFRESHED=0
typeset -gi CUSTOM_PROMPT_SERVICE_TTL=15
typeset -gi CUSTOM_PROMPT_COMPOSE_TTL=10
typeset -gi CUSTOM_PROMPT_SYSTEM_TTL=30
typeset -gi CUSTOM_PROMPT_EXTERNAL_IP_TTL=300

_custom_prompt_preexec() {
    CUSTOM_PROMPT_COMMAND_START=$EPOCHREALTIME
}

_custom_prompt_update_duration() {
    local -F elapsed
    local formatted

    if (( CUSTOM_PROMPT_COMMAND_START == 0 )); then
        CUSTOM_PROMPT_DURATION='%F{117}ready%f'
        return
    fi

    elapsed=$(( EPOCHREALTIME - CUSTOM_PROMPT_COMMAND_START ))
    if (( elapsed >= 60 )); then
        printf -v formatted '%.0fm %.1fs' \
            $(( elapsed / 60 )) $(( elapsed % 60 ))
    elif (( elapsed >= 1 )); then
        printf -v formatted '%.2fs' "$elapsed"
    else
        printf -v formatted '%.0fms' $(( elapsed * 1000 ))
    fi

    CUSTOM_PROMPT_DURATION="%F{117}${formatted}%f"
    CUSTOM_PROMPT_COMMAND_START=0
}

_custom_prompt_trim() {
    local value="$1"
    value="${value//$'\r'/}"
    value="${value%%$'\n'*}"
    value="${${value##[[:space:]]}%%[[:space:]]}"
    print -r -- "$value"
}

# Keep file and tool text literal inside a prompt_subst prompt.
# % is doubled, and $ ` \ are encoded so they are not expanded again.
_custom_prompt_escape() {
    local value="$1"
    local dollar_token='${CUSTOM_PROMPT_DOLLAR}'
    local tick_token='${CUSTOM_PROMPT_BACKTICK}'

    value="${value//\\/\\\\}"
    value="${value//\$/$dollar_token}"
    value="${value//\`/$tick_token}"
    value="${value//\%/%%}"
    print -r -- "$value"
}

# Visible columns of a prompt fragment.
# %D{...} is expanded first so strftime %S is not treated as a prompt code.
# Color codes are removed next, then the remaining prompt text is expanded once.
_custom_prompt_visible_length() {
    local str="$1" expanded token formatted
    local zero='%([BSUbfksu]|([FK]|){*})'
    setopt local_options extended_glob

    while [[ "$str" == (#b)*(%D\{[^}]#\})* ]]; do
        token="${match[1]}"
        formatted="${(%)token}"
        str="${str//"$token"/$formatted}"
    done

    expanded="${(S%%)str//$~zero}"
    expanded="${expanded//$'\e'\[[0-9;]##m/}"
    CUSTOM_PROMPT_VISIBLE_LENGTH=${#expanded}
}

# Next prompt token starting at index, so truncation does not cut a % code.
_custom_prompt_token_at() {
    local str="$1"
    local -i i="$2"
    local rest="${str[i,-1]}" piece
    setopt local_options extended_glob

    if [[ "$rest" == %%* ]]; then
        print -r -- '%%'
        return
    fi
    if [[ "$rest" == (#b)(%[FKD]\{[^}]#\})* ]]; then
        print -r -- "${match[1]}"
        return
    fi
    if [[ "$rest" == %?* ]]; then
        print -r -- "${rest[1,2]}"
        return
    fi
    print -r -- "${rest[1]}"
}

# Shorten a prompt fragment to a visible width, keeping color codes intact.
_custom_prompt_truncate_prompt() {
    local str="$1"
    local -i limit="$2"
    local -i i=1 n=${#str}
    local out="" piece trial

    (( limit < 2 )) && { print -r -- '…%f'; return }

    while (( i <= n )); do
        piece="$(_custom_prompt_token_at "$str" "$i")"
        [[ -n "$piece" ]] || break
        trial="${out}${piece}"
        _custom_prompt_visible_length "${trial}…%f"
        (( CUSTOM_PROMPT_VISIBLE_LENGTH > limit )) && break
        out="$trial"
        i+=${#piece}
    done
    print -r -- "${out}…%f"
}

# Left text, then spaces, then one grey note ending on the same right column.
# The note stays on the right even when the row is crowded; the left side
# shrinks first, then the note.
_custom_prompt_line() {
    local left="$1" right="$2"
    local -i columns left_len right_len gap budget left_budget
    local -i min_gap=2 min_note=4
    local pad escaped

    columns=${COLUMNS:-0}
    (( columns < 1 )) && columns=80
    columns=$(( columns - 1 ))

    if [[ -z "$right" ]]; then
        print -r -- "$left"
        return
    fi

    _custom_prompt_visible_length "$left"
    left_len=$CUSTOM_PROMPT_VISIBLE_LENGTH
    budget=$(( columns - left_len - min_gap ))

    if (( budget < min_note )); then
        left_budget=$(( columns - min_gap - min_note ))
        if (( left_budget < 8 )); then
            print -r -- "$left"
            return
        fi
        left="$(_custom_prompt_truncate_prompt "$left" "$left_budget")"
        _custom_prompt_visible_length "$left"
        left_len=$CUSTOM_PROMPT_VISIBLE_LENGTH
        budget=$(( columns - left_len - min_gap ))
    fi

    (( budget < 1 )) && { print -r -- "$left"; return }
    if (( ${#right} > budget )); then
        right="${right[1,$(( budget - 1 ))]}…"
    fi

    escaped="$(_custom_prompt_escape "$right")"
    _custom_prompt_visible_length "${CUSTOM_PROMPT_GHOST}${escaped}%f"
    right_len=$CUSTOM_PROMPT_VISIBLE_LENGTH
    gap=$(( columns - left_len - right_len ))
    (( gap < 1 )) && { print -r -- "$left"; return }

    printf -v pad '%*s' "$gap" ''
    print -r -- "${left}${pad}${CUSTOM_PROMPT_GHOST}${escaped}%f"
}

_custom_prompt_row() {
    local label="$1" value="$2" right="$3"
    local left="${CUSTOM_PROMPT_FRAME}├──%f ${CUSTOM_PROMPT_LABEL}${(r:7:)label}%f ${value}"
    _custom_prompt_line "$left" "$right"
}

_custom_prompt_uptime() {
    local boot_line boot_sec
    local -i elapsed days hours mins

    boot_line="$(command sysctl -n kern.boottime 2>/dev/null)"
    # Shortest match. The longest one also consumes "usec =".
    boot_sec="${boot_line#*sec = }"
    boot_sec="${boot_sec%%,*}"
    boot_sec="${boot_sec//[[:space:]]/}"
    [[ "$boot_sec" == <-> ]] || return 0

    elapsed=$(( EPOCHSECONDS - boot_sec ))
    (( elapsed < 0 )) && return 0
    days=$(( elapsed / 86400 ))
    hours=$(( (elapsed % 86400) / 3600 ))
    mins=$(( (elapsed % 3600) / 60 ))
    if (( days > 0 )); then
        print -r -- "${days}d ${hours}h"
    elif (( hours > 0 )); then
        print -r -- "${hours}h ${mins}m"
    else
        print -r -- "${mins}m"
    fi
}

_custom_prompt_bytes() {
    local -i bytes="$1"
    if (( bytes >= 1073741824 )); then
        print -r -- "$(( (bytes + 536870912) / 1073741824 ))G"
    elif (( bytes >= 1048576 )); then
        print -r -- "$(( (bytes + 524288) / 1048576 ))M"
    else
        print -r -- "${bytes}B"
    fi
}

_custom_prompt_marker() {
    local dir="$1" file="$2"
    if [[ -n "$dir" && "$dir" != "$PWD" ]]; then
        print -r -- "${dir:t}/${file}"
    else
        print -r -- "$file"
    fi
}

_custom_prompt_tool_version() {
    local dir="$1" tool="$2" version
    [[ -r "$dir/.tool-versions" ]] || return 0
    version="$(command awk -v tool="$tool" '$1 == tool { print $2; exit }' "$dir/.tool-versions")"
    _custom_prompt_trim "$version"
}

_custom_prompt_is_python_dir() {
    local dir="$1"
    [[ -f "$dir/poetry.lock" || -f "$dir/.python-version" || -d "$dir/.venv" ||
       -f "$dir/Pipfile" || -f "$dir/requirements.txt" || -f "$dir/setup.py" ||
       -f "$dir/setup.cfg" ]] && return 0
    [[ -f "$dir/pyproject.toml" ]] || return 1
    command grep -q -E '^\[(tool\.poetry|project)\]|poetry-core' "$dir/pyproject.toml"
}

_custom_prompt_is_poetry_dir() {
    local dir="$1"
    [[ -f "$dir/poetry.lock" ]] && return 0
    [[ -f "$dir/pyproject.toml" ]] || return 1
    command grep -q -E '^\[tool\.poetry(\.|])|poetry-core' "$dir/pyproject.toml"
}

_custom_prompt_poetry_name() {
    local dir="$1"
    [[ -f "$dir/pyproject.toml" ]] || return 0
    command awk '
        /^\[tool\.poetry\]/ { section = "poetry"; next }
        /^\[project\]/ { if (section != "poetry") section = "project"; next }
        /^\[/ { if (section != "poetry") section = ""; next }
        section && /^name[[:space:]]*=/ {
            if (match($0, /["'\''][^"'\'']+["'\'']/)) {
                print substr($0, RSTART + 1, RLENGTH - 2)
                if (section == "poetry") exit
                section = ""
            }
        }
    ' "$dir/pyproject.toml"
}

_custom_prompt_pyvenv_version() {
    local cfg="$1" version
    [[ -r "$cfg" ]] || return 0
    version="$(command awk -F' = ' '/^version =/ { print $2; exit }' "$cfg")"
    _custom_prompt_trim "$version"
}

# Nearest Python, Terraform, and Node markers between here and the git root.
_custom_prompt_scan_project() {
    [[ "$CUSTOM_PROMPT_SCAN_PWD" == "$PWD" ]] && return 0

    local dir="$PWD" depth=0
    local -a tf_files
    CUSTOM_PROMPT_SCAN_PWD="$PWD"
    CUSTOM_PROMPT_PY_DIR=""
    CUSTOM_PROMPT_TF_DIR=""
    CUSTOM_PROMPT_NODE_DIR=""
    CUSTOM_PROMPT_NODE_PIN_FILE=""
    CUSTOM_PROMPT_ROOT=""

    while (( depth++ < 12 )); do
        if [[ -z "$CUSTOM_PROMPT_PY_DIR" ]] && _custom_prompt_is_python_dir "$dir"; then
            CUSTOM_PROMPT_PY_DIR="$dir"
        elif [[ -z "$CUSTOM_PROMPT_PY_DIR" && -r "$dir/.tool-versions" ]] &&
             command grep -q '^python ' "$dir/.tool-versions"; then
            CUSTOM_PROMPT_PY_DIR="$dir"
        fi
        if [[ -z "$CUSTOM_PROMPT_TF_DIR" ]]; then
            tf_files=("$dir"/*.tf(N) "$dir"/*.tf.json(N))
            if [[ -d "$dir/.terraform" || -f "$dir/.terraform-version" ||
                  -f "$dir/.opentofu-version" || -f "$dir/terragrunt.hcl" ||
                  ${#tf_files} -gt 0 ]]; then
                CUSTOM_PROMPT_TF_DIR="$dir"
            elif [[ -r "$dir/.tool-versions" ]] &&
                 command grep -q '^terraform ' "$dir/.tool-versions"; then
                CUSTOM_PROMPT_TF_DIR="$dir"
            fi
        fi
        if [[ -z "$CUSTOM_PROMPT_NODE_DIR" &&
              ( -f "$dir/package.json" || -f "$dir/.nvmrc" || -f "$dir/.node-version" ) ]]; then
            CUSTOM_PROMPT_NODE_DIR="$dir"
        fi
        if [[ -z "$CUSTOM_PROMPT_NODE_PIN_FILE" ]]; then
            if [[ -f "$dir/.nvmrc" ]]; then
                CUSTOM_PROMPT_NODE_PIN_FILE="$dir/.nvmrc"
            elif [[ -f "$dir/.node-version" ]]; then
                CUSTOM_PROMPT_NODE_PIN_FILE="$dir/.node-version"
            fi
        fi
        if [[ -d "$dir/.git" || "$dir" == "/" ]]; then
            [[ -d "$dir/.git" ]] && CUSTOM_PROMPT_ROOT="$dir"
            break
        fi
        dir="${dir:h}"
    done
}

# kind, name, version, and 1 when that runtime is not activated.
_custom_prompt_lang_segment() {
    local color="$1" kind="$2" name="$3" version="$4" inactive="$5" value
    name="$(_custom_prompt_escape "$(_custom_prompt_trim "$name")")"
    version="$(_custom_prompt_escape "$(_custom_prompt_trim "$version")")"

    if [[ -n "$name" && -n "$version" ]]; then
        value="${kind}:${name}@${version}"
    elif [[ -n "$name" ]]; then
        value="${kind}:${name}"
    elif [[ -n "$version" ]]; then
        value="${kind}:${version}"
    else
        value="$kind"
    fi

    if (( inactive )); then
        print -r -- "%F{${color}}${value}%f %F{245}off%f"
    else
        print -r -- "%F{${color}}${value}%f"
    fi
}

_custom_prompt_add_python() {
    local dir="$CUSTOM_PROMPT_PY_DIR" name="" version="" poetry=0

    if [[ -n "$dir" ]] && _custom_prompt_is_poetry_dir "$dir"; then
        poetry=1
        name="$(_custom_prompt_poetry_name "$dir")"
    elif [[ -n "$POETRY_ACTIVE" && -n "$VIRTUAL_ENV" ]]; then
        poetry=1
        name="${VIRTUAL_ENV:t}"
    fi

    if [[ -n "$VIRTUAL_ENV" ]]; then
        version="$(_custom_prompt_pyvenv_version "$VIRTUAL_ENV/pyvenv.cfg")"
        if (( poetry )); then
            segments+=("$(_custom_prompt_lang_segment 180 poetry "${name:-${VIRTUAL_ENV:t}}" "$version" 0)")
        else
            segments+=("$(_custom_prompt_lang_segment yellow py "${VIRTUAL_ENV:t}" "$version" 0)")
        fi
        return 0
    fi

    if [[ -n "$CONDA_DEFAULT_ENV" ]]; then
        segments+=("$(_custom_prompt_lang_segment yellow conda "$CONDA_DEFAULT_ENV" "" 0)")
        return 0
    fi

    [[ -n "$dir" ]] || return 0

    if [[ -r "$dir/.venv/pyvenv.cfg" ]]; then
        version="$(_custom_prompt_pyvenv_version "$dir/.venv/pyvenv.cfg")"
        if (( poetry )); then
            segments+=("$(_custom_prompt_lang_segment 180 poetry "${name:-.venv}" "$version" 1)")
        else
            segments+=("$(_custom_prompt_lang_segment yellow py .venv "$version" 1)")
        fi
        return 0
    fi

    if [[ -r "$dir/.python-version" ]]; then
        version="$(_custom_prompt_trim "$(<"$dir/.python-version")")"
    else
        version="$(_custom_prompt_tool_version "$dir" python)"
    fi
    if (( poetry )); then
        segments+=("$(_custom_prompt_lang_segment 180 poetry "${name:-project}" "$version" 1)")
    elif [[ -n "$version" ]]; then
        segments+=("$(_custom_prompt_lang_segment yellow py "" "$version" 0)")
    elif [[ -n "$PYENV_VERSION" ]]; then
        segments+=("$(_custom_prompt_lang_segment yellow py "" "$PYENV_VERSION" 0)")
    fi
}

_custom_prompt_add_node() {
    local dir="$CUSTOM_PROMPT_NODE_DIR" pin="" active="" manager="" extra="" nvm_tag shown
    [[ -n "$dir" ]] || return 0

    if [[ -n "$CUSTOM_PROMPT_NODE_PIN_FILE" ]]; then
        pin="$(_custom_prompt_trim "$(<"$CUSTOM_PROMPT_NODE_PIN_FILE")")"
        pin="${pin#v}"
    fi
    [[ -z "$pin" ]] && pin="$(_custom_prompt_tool_version "$dir" nodejs)"

    nvm_tag="${NVM_BIN:h:t}"
    if [[ -n "$NVM_BIN" && ( "$nvm_tag" == v<->.* || "$nvm_tag" == <->.* ) ]]; then
        active="${nvm_tag#v}"
    elif [[ -n "$FNM_MULTISHELL_PATH" ]]; then
        active="${${FNM_MULTISHELL_PATH:h:t}#node-}"
        active="${active#v}"
    elif (( $+commands[node] )); then
        if [[ "$CUSTOM_PROMPT_NODE_BIN" != "$commands[node]" || -z "$CUSTOM_PROMPT_NODE_VERSION" ]]; then
            CUSTOM_PROMPT_NODE_BIN="$commands[node]"
            CUSTOM_PROMPT_NODE_VERSION="$(command node -p 'process.versions.node' 2>/dev/null)"
        fi
        active="$CUSTOM_PROMPT_NODE_VERSION"
    fi
    active="$(_custom_prompt_trim "$active")"

    if [[ -f "$dir/bun.lock" || -f "$dir/bun.lockb" ]]; then
        manager=bun
    elif [[ -f "$dir/pnpm-lock.yaml" ]]; then
        manager=pnpm
    elif [[ -f "$dir/yarn.lock" ]]; then
        manager=yarn
    fi

    if [[ -n "$pin" && -n "$active" && "$pin" != */* &&
          "$active" != "$pin" && "$active" != ${pin}.* ]]; then
        extra=" %F{245}pin:${pin}%f"
    fi
    [[ -n "$manager" ]] && extra+=" %F{245}${manager}%f"

    shown="${active:-$pin}"
    [[ -n "$shown" ]] || shown="project"
    segments+=("$(_custom_prompt_lang_segment green node "" "$shown" 0)${extra}")
}

_custom_prompt_add_terraform() {
    local dir="$CUSTOM_PROMPT_TF_DIR" workspace="default" version="" tool=tf
    local -a tf_files
    [[ -n "$dir" ]] || return 0

    if [[ -r "$dir/.terraform/environment" ]]; then
        workspace="$(_custom_prompt_trim "$(<"$dir/.terraform/environment")")"
    fi
    [[ -n "$workspace" ]] || workspace="default"

    if [[ -r "$dir/.terraform-version" ]]; then
        version="$(_custom_prompt_trim "$(<"$dir/.terraform-version")")"
    elif [[ -r "$dir/.opentofu-version" ]]; then
        version="$(_custom_prompt_trim "$(<"$dir/.opentofu-version")")"
        tool=tofu
    else
        tf_files=("$dir"/*.tf(N) "$dir"/*.tf.json(N))
        if (( ${#tf_files} )); then
            version="$(command awk -F'"' '/required_version[[:space:]]*=/ { print $2; exit }' "$tf_files[@]")"
            version="$(_custom_prompt_trim "$version")"
        fi
        [[ -z "$version" ]] && version="$(_custom_prompt_tool_version "$dir" terraform)"
    fi

    if [[ -d "$dir/.terraform" || -n "$version" || -f "$dir/.terraform-version" ||
          ${#tf_files} -gt 0 ]]; then
        segments+=("$(_custom_prompt_lang_segment 117 "$tool" "$workspace" "$version" 0)")
    fi
    [[ -f "$dir/terragrunt.hcl" ]] && segments+=("%F{117}tg%f")
}

_custom_prompt_update_context() {
    local -a segments
    local chart_name chart_version go_version

    _custom_prompt_scan_project
    _custom_prompt_add_python
    _custom_prompt_add_node

    if [[ -f go.mod ]]; then
        go_version="$(command awk '$1 == "go" { print $2; exit }' go.mod)"
        segments+=("$(_custom_prompt_lang_segment cyan go "" "$go_version" 0)")
    fi
    [[ -f Cargo.toml ]] && segments+=("%F{red}rust%f")

    _custom_prompt_add_terraform

    if [[ -f Chart.yaml ]]; then
        chart_name="$(command awk -F': *' '$1 == "name" { print $2; exit }' Chart.yaml)"
        chart_version="$(command awk -F': *' '$1 == "version" { print $2; exit }' Chart.yaml)"
        segments+=("%F{117}helm:${chart_name:-chart}${chart_version:+@${chart_version}}%f")
    fi

    [[ -f Dockerfile || -f compose.yaml || -f compose.yml ||
       -f docker-compose.yaml || -f docker-compose.yml ]] &&
        segments+=("%F{cyan}container-project%f")
    [[ -f kustomization.yaml || -f kustomization.yml ]] &&
        segments+=("%F{117}kustomize%f")
    [[ -f .trivyignore || -f trivy.yaml || -f trivy.yml ]] &&
        segments+=("%F{red}trivy-policy%f")

    if [[ -n "$AWS_PROFILE" ]]; then
        segments+=("%F{yellow}aws:${AWS_PROFILE}%f")
    elif [[ -n "$AWS_ACCESS_KEY_ID" ]]; then
        segments+=("%F{yellow}aws:env%f")
    fi

    if (( ${#segments} )); then
        CUSTOM_PROMPT_CONTEXT="${(j: :)segments}"
        CUSTOM_PROMPT_CONTEXT_RIGHT="$(_custom_prompt_context_hints)"
        [[ -n "$CUSTOM_PROMPT_CONTEXT_RIGHT" ]] || CUSTOM_PROMPT_CONTEXT_RIGHT="${PWD:t}"
        CUSTOM_PROMPT_CONTEXT_LINE="${CUSTOM_PROMPT_FRAME}├──%f ${CUSTOM_PROMPT_LABEL}env    %f ${CUSTOM_PROMPT_CONTEXT}"$'\n'
    else
        CUSTOM_PROMPT_CONTEXT=''
        CUSTOM_PROMPT_CONTEXT_RIGHT=''
        CUSTOM_PROMPT_CONTEXT_LINE=''
    fi
}

# Grey source notes for the env row: the file that produced each tool.
_custom_prompt_context_hints() {
    local -a hints
    local dir

    dir="$CUSTOM_PROMPT_PY_DIR"
    if [[ -n "$dir" ]]; then
        if [[ -f "$dir/pyproject.toml" ]]; then
            hints+=("$(_custom_prompt_marker "$dir" pyproject.toml)")
        elif [[ -f "$dir/.python-version" ]]; then
            hints+=("$(_custom_prompt_marker "$dir" .python-version)")
        elif [[ -d "$dir/.venv" ]]; then
            hints+=("$(_custom_prompt_marker "$dir" .venv)")
        elif [[ -f "$dir/Pipfile" ]]; then
            hints+=("$(_custom_prompt_marker "$dir" Pipfile)")
        fi
    fi

    dir="$CUSTOM_PROMPT_NODE_DIR"
    if [[ -n "$dir" ]]; then
        if [[ -n "$CUSTOM_PROMPT_NODE_PIN_FILE" ]]; then
            hints+=("$(_custom_prompt_marker "${CUSTOM_PROMPT_NODE_PIN_FILE:h}" "${CUSTOM_PROMPT_NODE_PIN_FILE:t}")")
        else
            hints+=("$(_custom_prompt_marker "$dir" package.json)")
        fi
    fi

    dir="$CUSTOM_PROMPT_TF_DIR"
    if [[ -n "$dir" ]]; then
        if [[ -f "$dir/.terraform-version" ]]; then
            hints+=("$(_custom_prompt_marker "$dir" .terraform-version)")
        elif [[ -f "$dir/.opentofu-version" ]]; then
            hints+=("$(_custom_prompt_marker "$dir" .opentofu-version)")
        elif [[ -f "$dir/terragrunt.hcl" ]]; then
            hints+=("$(_custom_prompt_marker "$dir" terragrunt.hcl)")
        else
            hints+=("$(_custom_prompt_marker "$dir" terraform)")
        fi
    fi

    [[ -f go.mod ]] && hints+=(go.mod)
    [[ -f Cargo.toml ]] && hints+=(Cargo.toml)
    [[ -f Chart.yaml ]] && hints+=(Chart.yaml)
    (( ${#hints} )) && print -r -- "${(j: · :)hints}"
}

_custom_prompt_update_gitops() {
    local -F now=$EPOCHREALTIME
    local argocd_context

    if (( CUSTOM_PROMPT_GITOPS_REFRESHED > 0 &&
          now - CUSTOM_PROMPT_GITOPS_REFRESHED < CUSTOM_PROMPT_SYSTEM_TTL )); then
        return
    fi

    local argocd_row argocd_server

    CUSTOM_PROMPT_GITOPS=''
    CUSTOM_PROMPT_GITOPS_RIGHT=''
    CUSTOM_PROMPT_GITOPS_LINE=''
    if (( $+commands[argocd] )); then
        argocd_row="$(command argocd context 2>/dev/null |
            command awk '$1 == "*" { print $2 "|" $3; exit }')"
        argocd_context="${argocd_row%%|*}"
        argocd_server="${argocd_row#*|}"
        [[ "$argocd_server" == "$argocd_row" ]] && argocd_server=""
        if [[ -n "$argocd_context" ]]; then
            CUSTOM_PROMPT_GITOPS="%F{magenta}argocd:${argocd_context}%f"
            CUSTOM_PROMPT_GITOPS_RIGHT="${argocd_server:-$argocd_context}"
            CUSTOM_PROMPT_GITOPS_LINE="${CUSTOM_PROMPT_FRAME}├──%f ${CUSTOM_PROMPT_LABEL}gitops %f ${CUSTOM_PROMPT_GITOPS}"$'\n'
        fi
    fi
    CUSTOM_PROMPT_GITOPS_REFRESHED=$now
}

_custom_prompt_update_services() {
    local -F now=$EPOCHREALTIME
    local -a services docker_parts svc_right
    local docker_context docker_info docker_version docker_running
    local docker_cpus docker_mem docker_ram
    local ollama_tags ollama_loaded ollama_models_count='?' ollama_loaded_count='?'

    if (( CUSTOM_PROMPT_SERVICES_REFRESHED > 0 &&
          now - CUSTOM_PROMPT_SERVICES_REFRESHED < CUSTOM_PROMPT_SERVICE_TTL )); then
        return
    fi

    if (( $+commands[docker] )); then
        docker_context="$(command docker context show 2>/dev/null)"
        [[ -n "$docker_context" ]] || docker_context='default'

        if docker_info="$(DOCKER_CLIENT_TIMEOUT=1 command docker info \
            --format '{{.ServerVersion}}|{{.ContainersRunning}}|{{.NCPU}}|{{.MemTotal}}' 2>/dev/null)"; then
            docker_parts=("${(@s:|:)docker_info}")
            docker_version="${docker_parts[1]}"
            docker_running="${docker_parts[2]}"
            docker_cpus="${docker_parts[3]}"
            docker_mem="${docker_parts[4]}"
            services+=("%F{green}docker:up@${docker_context}[${docker_running} running,v${docker_version}]%f")
            [[ "$docker_cpus" == <-> ]] && svc_right+=("${docker_cpus} cpu")
            if [[ "$docker_mem" == <-> ]]; then
                docker_ram="$(_custom_prompt_bytes "$docker_mem")"
                svc_right+=("${docker_ram} ram")
            fi
        else
            services+=("%F{red}docker:down@${docker_context}%f")
        fi
    fi

    if (( $+commands[ollama] && $+commands[curl] )); then
        if ollama_tags="$(command curl --fail --silent \
            --connect-timeout 0.15 --max-time 0.3 \
            http://127.0.0.1:11434/api/tags 2>/dev/null)"; then
            if (( $+commands[jq] )); then
                ollama_models_count="$(print -r -- "$ollama_tags" | command jq -r '.models | length')"
                ollama_loaded="$(command curl --fail --silent \
                    --connect-timeout 0.15 --max-time 0.3 \
                    http://127.0.0.1:11434/api/ps 2>/dev/null)"
                [[ -n "$ollama_loaded" ]] &&
                    ollama_loaded_count="$(print -r -- "$ollama_loaded" | command jq -r '.models | length')"
            fi
            services+=("%F{green}ollama:up[${ollama_loaded_count} loaded/${ollama_models_count} models]%f")
        else
            services+=('%F{red}ollama:down%f')
        fi
    fi

    if (( ${#services} )); then
        CUSTOM_PROMPT_SERVICES="${(j: :)services}"
    else
        CUSTOM_PROMPT_SERVICES='%F{white}no monitored services%f'
    fi
    CUSTOM_PROMPT_SERVICES_RIGHT="${(j: · :)svc_right}"
    [[ -n "$CUSTOM_PROMPT_SERVICES_RIGHT" ]] ||
        CUSTOM_PROMPT_SERVICES_RIGHT="${docker_context:-idle}"
    CUSTOM_PROMPT_SERVICES_REFRESHED=$now
}

_custom_prompt_update_compose() {
    local -F now=$EPOCHREALTIME
    local -a compose_files
    local compose_json summary project total running problems

    compose_files=(
        compose.yaml(N) compose.yml(N)
        docker-compose.yaml(N) docker-compose.yml(N)
    )

    if (( ! ${#compose_files} )); then
        CUSTOM_PROMPT_COMPOSE=''
        CUSTOM_PROMPT_COMPOSE_LINE=''
        CUSTOM_PROMPT_COMPOSE_RIGHT=''
        CUSTOM_PROMPT_COMPOSE_DIR="$PWD"
        CUSTOM_PROMPT_COMPOSE_REFRESHED=$now
        return
    fi

    if [[ "$CUSTOM_PROMPT_COMPOSE_DIR" == "$PWD" ]] &&
       (( CUSTOM_PROMPT_COMPOSE_REFRESHED > 0 &&
          now - CUSTOM_PROMPT_COMPOSE_REFRESHED < CUSTOM_PROMPT_COMPOSE_TTL )); then
        return
    fi

    CUSTOM_PROMPT_COMPOSE_DIR="$PWD"
    CUSTOM_PROMPT_COMPOSE_RIGHT="${(j: · :)compose_files:t}"
    if ! compose_json="$(DOCKER_CLIENT_TIMEOUT=1 command docker compose ps \
        --all --format json 2>/dev/null)"; then
        CUSTOM_PROMPT_COMPOSE='%F{red}unavailable%f'
    elif [[ -z "$compose_json" ]]; then
        CUSTOM_PROMPT_COMPOSE='%F{yellow}idle (no containers)%f'
    elif (( $+commands[jq] )); then
        summary="$(print -r -- "$compose_json" | command jq -sr '
            flatten |
            (.[0].Project // "compose") as $project |
            length as $total |
            ([.[] | select(.State == "running")] | length) as $running |
            ([.[] |
              select(.State != "running" or
                     (.Health != null and .Health != "" and .Health != "healthy")) |
              ((.Service // .Name // "service") + ":" +
               (if (.Health != null and .Health != "" and .Health != "healthy")
                then .Health else .State end))] | join(",")) as $problems |
            [$project, $total, $running, $problems] | @tsv
        ' 2>/dev/null)"
        IFS=$'\t' read -r project total running problems <<< "$summary"
        project="${project//\%/%%}"
        problems="${problems//\%/%%}"

        if [[ -z "$total" ]]; then
            CUSTOM_PROMPT_COMPOSE='%F{red}status parse error%f'
        elif [[ -n "$problems" ]]; then
            CUSTOM_PROMPT_COMPOSE="%F{red}${project} ${running}/${total} up ${problems}%f"
        else
            CUSTOM_PROMPT_COMPOSE="%F{green}${project} ${running}/${total} up%f"
        fi
    else
        CUSTOM_PROMPT_COMPOSE='%F{yellow}active (install jq for details)%f'
    fi

    CUSTOM_PROMPT_COMPOSE_LINE="${CUSTOM_PROMPT_FRAME}├──%f ${CUSTOM_PROMPT_LABEL}compose%f ${CUSTOM_PROMPT_COMPOSE}"$'\n'
    CUSTOM_PROMPT_COMPOSE_REFRESHED=$now
}

_custom_prompt_update_kube() {
    local -F now=$EPOCHREALTIME
    local kube_context kube_namespace kube_meta kube_cluster kube_user kube_count
    local -a kube_right

    if (( CUSTOM_PROMPT_KUBE_REFRESHED > 0 &&
          now - CUSTOM_PROMPT_KUBE_REFRESHED < CUSTOM_PROMPT_SERVICE_TTL )); then
        return
    fi

    if (( ! $+commands[kubectl] )); then
        CUSTOM_PROMPT_KUBE='%F{red}kubectl unavailable%f'
        CUSTOM_PROMPT_KUBE_RIGHT='offline'
        CUSTOM_PROMPT_KUBE_REFRESHED=$now
        return
    fi

    kube_context="$(command kubectl config current-context 2>/dev/null)"
    if [[ -z "$kube_context" ]]; then
        CUSTOM_PROMPT_KUBE='%F{red}no active context%f'
        CUSTOM_PROMPT_KUBE_RIGHT='offline'
        CUSTOM_PROMPT_KUBE_REFRESHED=$now
        return
    fi

    kube_meta="$(command kubectl config view --minify \
        --output 'jsonpath={.contexts[0].context.cluster}{"|"}{.contexts[0].context.user}{"|"}{.contexts[0].context.namespace}' 2>/dev/null)"
    IFS='|' read -r kube_cluster kube_user kube_namespace <<< "$kube_meta"
    [[ -n "$kube_namespace" ]] || kube_namespace='default'
    kube_count="$(command kubectl config get-contexts --output name 2>/dev/null | command wc -l)"
    kube_count="${kube_count//[[:space:]]/}"

    [[ -n "$kube_user" ]] && kube_right+=("user ${kube_user}")
    [[ -n "$kube_cluster" ]] && kube_right+=("cluster ${kube_cluster}")
    [[ "$kube_count" == <-> ]] && kube_right+=("${kube_count} ctx")
    CUSTOM_PROMPT_KUBE_RIGHT="${(j: · :)kube_right}"
    CUSTOM_PROMPT_KUBE="%F{117}context:${kube_context}%f %F{cyan}ns:${kube_namespace}%f"
    CUSTOM_PROMPT_KUBE_REFRESHED=$now
}

_custom_prompt_update_system() {
    local -F now=$EPOCHREALTIME
    local battery_data battery_percent battery_state battery_left battery_color=green
    local load_data load_one load_color=green logical_cpus uptime_text
    local -a sys_right
    local memory_free memory_used memory_color=green
    local disk_used disk_color=green local_ip='offline'
    local iface candidate_ip

    if (( CUSTOM_PROMPT_SYSTEM_REFRESHED > 0 &&
          now - CUSTOM_PROMPT_SYSTEM_REFRESHED < CUSTOM_PROMPT_SYSTEM_TTL )); then
        return
    fi

    battery_data="$(command pmset -g batt 2>/dev/null | command awk '
        match($0, /[0-9]+%/) {
            pct = substr($0, RSTART, RLENGTH)
            remain = ""
            if (match($0, /[0-9]+:[0-9]+ remaining/)) {
                remain = substr($0, RSTART, RLENGTH)
                sub(/ remaining/, "", remain)
            }
            if ($0 ~ /discharging/) state = "battery"
            else if ($0 ~ /not charging|AC attached/) state = "AC"
            else if ($0 ~ /charging/) state = "charging"
            else state = "unknown"
            print pct "|" state "|" remain
            exit
        }')"
    IFS='|' read -r battery_percent battery_state battery_left <<< "$battery_data"
    if [[ -n "$battery_percent" ]]; then
        battery_percent="${battery_percent%%%}"
        if (( battery_percent < 20 )); then
            battery_color=red
        elif (( battery_percent < 50 )); then
            battery_color=yellow
        fi
    else
        battery_percent='?'
        battery_state='unknown'
    fi

    load_data="$(command sysctl -n vm.loadavg 2>/dev/null)"
    load_data="${load_data#\{}"
    load_one="${${(z)load_data}[1]:-?}"
    logical_cpus="$(command sysctl -n hw.logicalcpu 2>/dev/null)"
    if [[ "$load_one" == <->(|.<->) && "$logical_cpus" == <-> ]]; then
        (( load_one >= logical_cpus * 1.5 )) && load_color=red
        (( load_one >= logical_cpus * 0.75 && load_one < logical_cpus * 1.5 )) &&
            load_color=yellow
    fi

    memory_free="$(command memory_pressure 2>/dev/null | command awk -F': |%' \
        '/System-wide memory free percentage/ { print $2; exit }')"
    if [[ "$memory_free" == <-> ]]; then
        memory_used=$(( 100 - memory_free ))
        (( memory_used >= 85 )) && memory_color=red
        (( memory_used >= 70 && memory_used < 85 )) && memory_color=yellow
    else
        memory_used='?'
    fi

    disk_used="$(command df -H / 2>/dev/null | command awk 'NR == 2 { gsub(/%/, "", $5); print $5 }')"
    if [[ "$disk_used" == <-> ]]; then
        (( disk_used >= 90 )) && disk_color=red
        (( disk_used >= 75 && disk_used < 90 )) && disk_color=yellow
    else
        disk_used='?'
    fi

    for iface in en0 en1; do
        candidate_ip="$(command ipconfig getifaddr "$iface" 2>/dev/null)"
        if [[ -n "$candidate_ip" ]]; then
            local_ip="$candidate_ip"
            break
        fi
    done

    _custom_prompt_update_external_ip
    if [[ "$battery_left" == <->:<-> && "$battery_left" != 0:00 ]]; then
        sys_right+=("left ${battery_left}")
    fi
    uptime_text="$(_custom_prompt_uptime)"
    [[ -n "$uptime_text" ]] && sys_right+=("up ${uptime_text}")
    [[ "$logical_cpus" == <-> ]] && sys_right+=("${logical_cpus} cores")
    CUSTOM_PROMPT_SYSTEM_RIGHT="${(j: · :)sys_right}"
    CUSTOM_PROMPT_SYSTEM="%F{${battery_color}}bat:${battery_percent}%%/${battery_state}%f %F{${load_color}}load:${load_one}%f %F{${memory_color}}mem:${memory_used}%%%f %F{${disk_color}}disk:${disk_used}%%%f %F{cyan}lan:${local_ip}%f %F{magenta}wan:${CUSTOM_PROMPT_EXTERNAL_IP}%f"
    CUSTOM_PROMPT_SYSTEM_REFRESHED=$now
}

_custom_prompt_update_external_ip() {
    local -F now=$EPOCHREALTIME
    local external_ip

    if (( CUSTOM_PROMPT_EXTERNAL_IP_REFRESHED > 0 &&
          now - CUSTOM_PROMPT_EXTERNAL_IP_REFRESHED < CUSTOM_PROMPT_EXTERNAL_IP_TTL )); then
        return
    fi

    external_ip="$(command curl --fail --silent \
        --connect-timeout 0.4 --max-time 1 https://api.ipify.org 2>/dev/null)"
    if [[ "$external_ip" == <->.<->.<->.<-> || "$external_ip" == *:* ]]; then
        CUSTOM_PROMPT_EXTERNAL_IP="$external_ip"
    else
        CUSTOM_PROMPT_EXTERNAL_IP='unavailable'
    fi
    CUSTOM_PROMPT_EXTERNAL_IP_REFRESHED=$now
}

# Build every tree row with its own grey right-hand note.
# The input line stays short so the cursor remains after ❯; its note is RPROMPT.
_custom_prompt_render() {
    local -a lines session path_right
    local left tmux_session term_name

    (( ${#jobstates} > 0 )) && session+=("jobs ${#jobstates}")
    session+=("hist ${HISTCMD}")
    if [[ -n "${TTY:t}" ]]; then
        session+=("tty ${${TTY:t}#tty}")
    fi
    if [[ -n "$TMUX" ]]; then
        tmux_session="$(command tmux display-message -p '#S' 2>/dev/null)"
        tmux_session="${tmux_session%%$'\n'*}"
        session+=("tmux ${tmux_session:-on}")
    elif [[ -n "$TERM_PROGRAM" ]]; then
        case "$TERM_PROGRAM" in
            Apple_Terminal) term_name=terminal ;;
            iTerm.app) term_name=iterm ;;
            vscode) term_name=vscode ;;
            *) term_name="${TERM_PROGRAM:l}" ;;
        esac
        session+=("$term_name")
    fi

    left="${CUSTOM_PROMPT_FRAME}╭──%f ${CUSTOM_PROMPT_STATUS} %F{109}%n@%m%f ${CUSTOM_PROMPT_DIM}·%f %F{117}%D{%Y-%m-%d %H:%M:%S}%f ${CUSTOM_PROMPT_DIM}·%f ${CUSTOM_PROMPT_DURATION} ${CUSTOM_PROMPT_DIM}·%f ${CUSTOM_PROMPT_LABEL}zsh ${ZSH_VERSION}  lvl ${SHLVL}%f"
    lines+=("$(_custom_prompt_line "$left" "${(j: · :)session}")")
    lines+=("$(_custom_prompt_row k8s "$CUSTOM_PROMPT_KUBE" "$CUSTOM_PROMPT_KUBE_RIGHT")")
    [[ -n "$CUSTOM_PROMPT_GITOPS" ]] &&
        lines+=("$(_custom_prompt_row gitops "$CUSTOM_PROMPT_GITOPS" "$CUSTOM_PROMPT_GITOPS_RIGHT")")
    [[ -n "$CUSTOM_PROMPT_CONTEXT" ]] &&
        lines+=("$(_custom_prompt_row env "$CUSTOM_PROMPT_CONTEXT" "$CUSTOM_PROMPT_CONTEXT_RIGHT")")
    lines+=("$(_custom_prompt_row svc "$CUSTOM_PROMPT_SERVICES" "$CUSTOM_PROMPT_SERVICES_RIGHT")")
    [[ -n "$CUSTOM_PROMPT_COMPOSE" ]] &&
        lines+=("$(_custom_prompt_row compose "$CUSTOM_PROMPT_COMPOSE" "$CUSTOM_PROMPT_COMPOSE_RIGHT")")
    lines+=("$(_custom_prompt_row sys "$CUSTOM_PROMPT_SYSTEM" "$CUSTOM_PROMPT_SYSTEM_RIGHT")")

    left="${CUSTOM_PROMPT_FRAME}╰──%f %F{117}%~%f${vcs_info_msg_0_} %F{green}❯%f "
    lines+=("$left")
    CUSTOM_PROMPT_RENDERED="${(F)lines}"

    [[ -n "$CUSTOM_PROMPT_ROOT" && "${CUSTOM_PROMPT_ROOT:t}" != "${PWD:t}" ]] &&
        path_right+=("${CUSTOM_PROMPT_ROOT:t}")
    local sha="${${vcs_info_msg_1_#[[:space:]]}%%[[:space:]]}"
    [[ -n "$sha" ]] && path_right+=("rev ${sha}")
    # Same one-column inset as the padded rows above (COLUMNS - 1).
    ZLE_RPROMPT_INDENT=1
    if (( ${#path_right} )); then
        RPROMPT="${CUSTOM_PROMPT_GHOST}$(_custom_prompt_escape "${(j: · :)path_right}")%f"
    else
        RPROMPT=''
    fi
}

_custom_prompt_precmd() {
    local exit_code=$?

    if (( exit_code == 0 )); then
        CUSTOM_PROMPT_STATUS='%F{green}✓%f'
    else
        CUSTOM_PROMPT_STATUS="%F{red}✗ ${exit_code}%f"
    fi

    _custom_prompt_update_duration
    vcs_info
    _custom_prompt_update_context
    _custom_prompt_update_gitops
    _custom_prompt_update_services
    _custom_prompt_update_compose
    _custom_prompt_update_kube
    _custom_prompt_update_system
    _custom_prompt_render
    return $exit_code
}

# Force the cached Docker/Ollama state to refresh on the next prompt.
prompt-refresh() {
    CUSTOM_PROMPT_SERVICES_REFRESHED=0
    CUSTOM_PROMPT_COMPOSE_REFRESHED=0
    CUSTOM_PROMPT_KUBE_REFRESHED=0
    CUSTOM_PROMPT_GITOPS_REFRESHED=0
    CUSTOM_PROMPT_SYSTEM_REFRESHED=0
    CUSTOM_PROMPT_EXTERNAL_IP_REFRESHED=0
    _custom_prompt_update_services
    _custom_prompt_update_compose
    _custom_prompt_update_kube
    _custom_prompt_update_gitops
    _custom_prompt_update_system
    print -P -- "%F{green}Prompt status refreshed:%f ${CUSTOM_PROMPT_SERVICES} ${CUSTOM_PROMPT_COMPOSE} ${CUSTOM_PROMPT_KUBE} ${CUSTOM_PROMPT_GITOPS} ${CUSTOM_PROMPT_SYSTEM}"
}

# Operational dashboard and shortcuts for tools represented by the prompt.
# Usage: prompt-tools [status|system|git|docker|compose|ollama|brew|kube|argocd|krew|vault|gh|iac|scan|versions|doctor|help]
prompt-tools() {
    local section="${1:-status}"

    case "$section" in
        status)
            CUSTOM_PROMPT_SERVICES_REFRESHED=0
            CUSTOM_PROMPT_COMPOSE_REFRESHED=0
            CUSTOM_PROMPT_KUBE_REFRESHED=0
            CUSTOM_PROMPT_GITOPS_REFRESHED=0
            CUSTOM_PROMPT_SYSTEM_REFRESHED=0
            CUSTOM_PROMPT_EXTERNAL_IP_REFRESHED=0
            _custom_prompt_update_context
            _custom_prompt_update_services
            _custom_prompt_update_compose
            _custom_prompt_update_kube
            _custom_prompt_update_gitops
            _custom_prompt_update_system
            print -P -- "%BService status%b  ${CUSTOM_PROMPT_SERVICES}"
            [[ -n "$CUSTOM_PROMPT_COMPOSE" ]] &&
                print -P -- "%BDocker Compose%b ${CUSTOM_PROMPT_COMPOSE}"
            print -P -- "%BKubernetes%b     ${CUSTOM_PROMPT_KUBE}"
            [[ -n "$CUSTOM_PROMPT_GITOPS" ]] &&
                print -P -- "%BGitOps%b        ${CUSTOM_PROMPT_GITOPS}"
            print -P -- "%BSystem health%b  ${CUSTOM_PROMPT_SYSTEM}"
            [[ -n "$CUSTOM_PROMPT_CONTEXT" ]] &&
                print -P -- "%BProject context%b ${CUSTOM_PROMPT_CONTEXT}"
            print -- "Actions: prompt-tools system|git|docker|compose|ollama|brew|kube|argocd|krew|vault|gh|iac|scan|versions|doctor"
            ;;
        system)
            command pmset -g batt
            print -- "Load: $(command sysctl -n vm.loadavg 2>/dev/null)"
            command memory_pressure 2>/dev/null | command sed -n \
                '/System-wide memory free percentage/p'
            command df -H /
            print -- "Uptime: $(command uptime)"
            ;;
        git)
            command git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
                print -u2 -- 'not inside a Git repository'
                return 1
            }
            command git status --short --branch
            print -- $'\nRecent commits:'
            command git log -5 --oneline --decorate
            ;;
        docker)
            (( $+commands[docker] )) || { print -u2 -- 'docker is not installed'; return 1; }
            print -- "Context: $(command docker context show 2>/dev/null)"
            command docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
            ;;
        compose)
            (( $+commands[docker] )) || { print -u2 -- 'docker is not installed'; return 1; }
            if [[ ! -f compose.yaml && ! -f compose.yml &&
                  ! -f docker-compose.yaml && ! -f docker-compose.yml ]]; then
                print -u2 -- 'no Compose file in the current directory'
                return 1
            fi
            command docker compose ps --all
            ;;
        ollama)
            (( $+commands[ollama] )) || { print -u2 -- 'ollama is not installed'; return 1; }
            print -- 'Loaded models:'
            command ollama ps
            print -- $'\nAvailable models:'
            command ollama list
            ;;
        brew)
            (( $+commands[brew] )) || { print -u2 -- 'brew is not installed'; return 1; }
            command brew outdated --verbose
            ;;
        kube|kubernetes)
            (( $+commands[kubectl] )) || { print -u2 -- 'kubectl is not installed'; return 1; }
            print -- "Context: $(command kubectl config current-context 2>/dev/null)"
            print -- "Namespace: $(command kubectl config view --minify --output 'jsonpath={..namespace}' 2>/dev/null || print default)"
            print -- $'\nPods:'
            command kubectl get pods --request-timeout=3s
            ;;
        argocd)
            (( $+commands[argocd] )) || { print -u2 -- 'argocd is not installed'; return 1; }
            command argocd context
            ;;
        krew)
            command kubectl krew list
            ;;
        vault)
            (( $+commands[vault] )) || { print -u2 -- 'vault is not installed'; return 1; }
            print -- 'Local encrypted environment vault:'
            command vault status
            command vault show-config
            ;;
        gh|github)
            (( $+commands[gh] )) || { print -u2 -- 'gh is not installed'; return 1; }
            command gh auth status
            command git rev-parse --is-inside-work-tree >/dev/null 2>&1 &&
                command gh repo view --json nameWithOwner,defaultBranchRef \
                    --jq '"Repository: \(.nameWithOwner)\nDefault branch: \(.defaultBranchRef.name)"'
            ;;
        terraform|tf|iac)
            if (( $+commands[terraform] )); then
                command terraform version
                [[ -d .terraform ]] && command terraform workspace show
            fi
            if (( $+commands[tofu] )); then
                print -- $'\nOpenTofu:'
                command tofu version
            fi
            ;;
        scan|trivy)
            (( $+commands[trivy] )) || { print -u2 -- 'trivy is not installed'; return 1; }
            command trivy fs --scanners vuln,misconfig,secret "${2:-.}"
            ;;
        versions)
            (( $+commands[docker] )) && command docker --version 2>/dev/null
            (( $+commands[kubectl] )) && command kubectl version --client 2>/dev/null | command sed -n '1,3p'
            (( $+commands[aws] )) && command aws --version 2>&1
            (( $+commands[ollama] )) && command ollama --version 2>/dev/null
            (( $+commands[argocd] )) && command argocd version --client --short 2>/dev/null
            (( $+commands[helm] )) && command helm version --short 2>/dev/null
            (( $+commands[k9s] )) && command k9s version --short 2>/dev/null
            (( $+commands[terraform] )) && command terraform version 2>/dev/null | command sed -n '1p'
            (( $+commands[tofu] )) && command tofu version 2>/dev/null | command sed -n '1p'
            (( $+commands[trivy] )) && command trivy version 2>/dev/null | command sed -n '1p'
            (( $+commands[gh] )) && command gh --version 2>/dev/null | command sed -n '1p'
            ;;
        doctor)
            print -- 'DevOps CLI diagnostics:'
            (( $+commands[yq] )) || print -P -- '%F{red}missing:%f yq (required by the ksphere helper)'
            (( $+commands[ansible] )) || print -P -- '%F{yellow}optional:%f ansible is not installed'
            (( $+commands[gcloud] )) || print -P -- '%F{white}not found:%f gcloud'
            (( $+commands[az] )) || print -P -- '%F{white}not found:%f Azure CLI'
            print -P -- '%F{yellow}name collision:%f vault is vault-cli for encrypted env files, not HashiCorp Vault'
            print -P -- '%F{yellow}name collision:%f tilt is a Ruby template processor, not Tilt Dev'
            command kubectl config current-context >/dev/null 2>&1 ||
                print -P -- '%F{red}configuration:%f kubectl has no active context'
            command docker info >/dev/null 2>&1 ||
                print -P -- '%F{red}service:%f Docker daemon is unavailable'
            command curl --fail --silent --max-time 0.3 \
                http://127.0.0.1:11434/api/tags >/dev/null 2>&1 ||
                print -P -- '%F{red}service:%f Ollama is unavailable'
            print -- 'Diagnostics complete.'
            ;;
        help|-h|--help)
            print -- 'prompt-tools status     live service and project summary'
            print -- 'prompt-tools system     battery, memory, disk, and uptime'
            print -- 'prompt-tools git        status and five recent commits'
            print -- 'prompt-tools docker     running containers'
            print -- 'prompt-tools compose    Compose services in this directory'
            print -- 'prompt-tools ollama     loaded and available models'
            print -- 'prompt-tools brew       outdated formulae and casks'
            print -- 'prompt-tools kube       context, namespace, and pods'
            print -- 'prompt-tools argocd     configured Argo CD contexts'
            print -- 'prompt-tools krew       installed kubectl plugins'
            print -- 'prompt-tools vault      local encrypted environment-vault status'
            print -- 'prompt-tools gh         GitHub authentication and current repository'
            print -- 'prompt-tools iac        Terraform/OpenTofu versions and workspace'
            print -- 'prompt-tools scan PATH  Trivy vulnerability/config/secret scan'
            print -- 'prompt-tools versions   installed DevOps CLI versions'
            print -- 'prompt-tools doctor     dependencies, collisions, and service checks'
            print -- 'prompt-refresh          force service-cache refresh'
            ;;
        *)
            print -u2 -- "Unknown section: $section (try: prompt-tools help)"
            return 2
            ;;
    esac
}

# Keep status capture first and avoid duplicate hooks when this file is reloaded.
typeset -ga precmd_functions preexec_functions
precmd_functions=(_custom_prompt_precmd ${precmd_functions:#_custom_prompt_precmd})
preexec_functions=(_custom_prompt_preexec ${preexec_functions:#_custom_prompt_preexec})

# PS1 is rebuilt in precmd. Each row above the input line has a grey note
# on the right. The input line uses RPROMPT so the cursor stays after ❯.
# 1. Status, identity, clock, duration, shell. Right: jobs, history, tty, tmux.
# 2. Kubernetes context and namespace. Right: user, cluster, context count.
# 3. Active Argo CD context. Right: server.
# 4. Project tools. Right: the file each tool came from.
# 5. Docker and Ollama. Right: engine cpu and memory.
# 6. Docker Compose, when this directory has a compose file. Right: file name.
# 7. Battery, load, memory, disk, and network. Right: time left, uptime, cores.
# 8. Working directory, Git branch, and ❯. Right: repo name and short revision.
PS1='${CUSTOM_PROMPT_RENDERED}'
RPROMPT=''

# PS2 uses the same tail as PS1. %_ is the unfinished quote, loop, pipe, or block.
PS2='${CUSTOM_PROMPT_FRAME}╰──%f ${CUSTOM_PROMPT_LABEL}%_%f %F{green}❯%f '
