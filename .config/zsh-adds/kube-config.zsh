# Set the default kube context if present
DEFAULT_KUBE_CONTEXTS="$HOME/.kube/config"
if test -f "${DEFAULT_KUBE_CONTEXTS}"
then
  export KUBECONFIG="$DEFAULT_KUBE_CONTEXTS"
fi
# Additional contexts should be in ~/.kube/custom-contexts/
CUSTOM_KUBE_CONTEXTS="$HOME/.kube/custom-contexts"
mkdir -p "${CUSTOM_KUBE_CONTEXTS}"

# Prepend additional contexts without changing global IFS. Include both common
# Kubernetes YAML extensions and safely handle spaces in filenames.
for contextFile in "${CUSTOM_KUBE_CONTEXTS}"/**/*.(yml|yaml)(N.); do
    export KUBECONFIG="$contextFile${KUBECONFIG:+:$KUBECONFIG}"
done

unset contextFile
