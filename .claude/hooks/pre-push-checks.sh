#!/usr/bin/env bash
#
# Claude Code PreToolUse hook (matcher: Bash).
# Cuando el comando es un `git push`, corre los mismos checks rápidos que CI
# (lint → typecheck → tests) ANTES de dejar pushear. Si algo falla, BLOQUEA el
# push (exit 2) y le devuelve el error a Claude para que lo arregle y reintente.
# El build de prod NO se corre acá (lento); lo cubre CI.
#
# Para cualquier otro comando Bash: no-op inmediato (exit 0).
# Para saltearlo a propósito: `git push --no-verify` (el hook lo detecta y pasa).

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""')

# ¿Es un git push? (al inicio o tras ; && || o espacio). Si no, pasar de largo.
if ! printf '%s' "$cmd" | grep -Eq '(^|[;&|[:space:]])git[[:space:]]+push'; then
  exit 0
fi

# Escape hatch explícito.
if printf '%s' "$cmd" | grep -Eq '(--no-verify|--dry-run)'; then
  exit 0
fi

cwd=$(printf '%s' "$input" | jq -r '.cwd // "."')
cd "$cwd" 2>/dev/null || exit 0

log=$(mktemp)
run() {
  # $1 = etiqueta, resto = comando
  local label="$1"; shift
  if ! "$@" >"$log" 2>&1; then
    {
      echo "🚫 pre-push BLOQUEADO: '$label' falló. Arreglá esto antes de pushear (o usá git push --no-verify si es intencional)."
      echo "----- salida de $label -----"
      tail -40 "$log"
    } >&2
    rm -f "$log"
    exit 2
  fi
}

run "npm run lint" npm run lint
run "npm run typecheck" npm run typecheck
run "npm test" npm test

rm -f "$log"
exit 0
