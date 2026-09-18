#!/usr/bin/env bash
#
# Busca datos personales en un texto y falla si encuentra algo.
#
# Uso:  scan-private-data.sh <etiqueta> <archivo-a-revisar> [modo]
#       modo = "mensaje" habilita además la regla de montos (ver abajo).
#
# El repo es PÚBLICO. Lo que entra acá queda para siempre: GitHub conserva los
# commits huérfanos por SHA aunque se reescriba la historia, así que el único
# momento barato para frenar una fuga es antes de que exista el commit.
#
# Qué mira:
#
#   1. La lista de valores privados de .claude/private-values.txt (NO versionada).
#      Coincidencia literal, sin distinguir mayúsculas. Es la regla de cero falsos
#      positivos: lo que esté ahí no se publica nunca.
#
#   2. Patrones que no necesitan configuración: CUIT/CUIL, claves privadas y
#      direcciones de mail que no sean de servicio.
#
#   3. Sólo en mensajes de commit: importes con separadores de miles. El código
#      tiene montos legítimos por todos lados (las escalas del monotributo son
#      literalmente eso), pero un mensaje de commit casi nunca necesita una cifra
#      exacta, y cuando la necesita suele ser justamente la que no hay que
#      publicar.
#
# Escape: `--no-verify` en el comando de git, o GARCA_ALLOW_PRIVATE=1.

set -uo pipefail

etiqueta="${1:?falta la etiqueta}"
archivo="${2:?falta el archivo}"
modo="${3:-}"

[ -n "${GARCA_ALLOW_PRIVATE:-}" ] && exit 0
[ -s "$archivo" ] || exit 0

raiz=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
denylist="$raiz/.claude/private-values.txt"

hallazgos=()

# ── 1. Valores privados declarados ───────────────────────────────────────────
if [ -f "$denylist" ]; then
  while IFS= read -r valor; do
    # Se ignoran comentarios y líneas vacías. Menos de 4 caracteres no se busca:
    # daría falsos positivos en cualquier lado.
    [[ -z "$valor" || "$valor" == \#* ]] && continue
    [ "${#valor}" -lt 4 ] && continue

    if grep -qiF -- "$valor" "$archivo"; then
      # No se imprime el valor encontrado: este mensaje puede terminar en un log.
      hallazgos+=("un valor de tu lista privada (.claude/private-values.txt)")
    fi
  done < "$denylist"
fi

# ── 2. Patrones que siempre son datos personales ─────────────────────────────
# NO hay regla genérica de CUIT a propósito. Este repo trata sobre CUITs: los
# fixtures de tests y la demo están llenos de números con esa forma
# (20111111110, 20345678901, 20-30123456-3...). Un patrón genérico marca todo y
# deja de leerse. El CUIT que importa —el tuyo— va en private-values.txt, que no
# tiene falsos positivos por definición.

if grep -qE 'BEGIN [A-Z ]*PRIVATE KEY' "$archivo"; then
  hallazgos+=("una clave privada")
fi

# Mails de proveedores personales. Un fixture usa "c@x.com" o "test@example.com";
# nadie pone una casilla de Gmail en un test por accidente.
if grep -qiE '[A-Za-z0-9._%+-]+@(gmail|hotmail|outlook|live|yahoo|icloud|me|proton(mail)?|gmx|aol)\.[A-Za-z.]{2,}' "$archivo"; then
  hallazgos+=("una dirección de mail personal")
fi

# ── 3. Importes, sólo en mensajes de commit ──────────────────────────────────
if [ "$modo" = "mensaje" ]; then
  # El "$" es opcional: la cifra sola es tan reveladora como con el símbolo.
  # Pide 7+ dígitos con separadores de miles, así "1.376 tests" no dispara.
  if grep -qE '(^|[^0-9])[0-9]{1,3}([.,][0-9]{3}){2,}([^0-9]|$)' "$archivo"; then
    hallazgos+=("un importe con cifras exactas")
  fi
fi

[ ${#hallazgos[@]} -eq 0 ] && exit 0

{
  echo ""
  echo "🚫 BLOQUEADO — $etiqueta parece tener datos tuyos."
  echo ""
  for h in "${hallazgos[@]}"; do
    echo "   • $h"
  done
  echo ""
  echo "   Este repo es público y el historial de git no se borra del todo:"
  echo "   GitHub conserva los commits huérfanos por SHA aunque se reescriba."
  echo ""
  echo "   Sacalo y volvé a intentar. Si es un falso positivo:"
  echo "     GARCA_ALLOW_PRIVATE=1 <tu comando>     (o --no-verify)"
  echo ""
} >&2

exit 1
