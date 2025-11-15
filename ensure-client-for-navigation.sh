#!/usr/bin/env bash
set -euo pipefail
echo "Scanning for files that import next/navigation..."

files=$(grep -R --line-number --exclude-dir=node_modules --include=\*.tsx "from ['\"]next/navigation['\"]" src 2>/dev/null | cut -d: -f1 | sort -u)

if [ -z "$files" ]; then
  echo "No files found that import next/navigation under src/. Nothing to change."
  exit 0
fi

echo "Found files:"
echo "$files"
echo

for f in $files; do
  bak="${f}.bak"
  if [ ! -f "$bak" ]; then
    cp -v "$f" "$bak"
  else
    echo "Backup already exists: $bak"
  fi

  # read file, remove BOM + leading blank lines, and ensure "use client"; is first non-blank line
  python3 - <<PY
from pathlib import Path
p = Path("$f")
text = p.read_text(encoding="utf-8", errors="ignore")
# remove BOM
if text.startswith("\ufeff"):
    text = text.lstrip("\ufeff")
# strip leading whitespace/newlines
stripped = text.lstrip("\r\n\t ")
lines = stripped.splitlines()
first = lines[0] if lines else ""
if first.strip() == '"use client";':
    print("[OK] already client:", "$f")
else:
    new_text = '"use client";\n' + stripped
    p.write_text(new_text, encoding="utf-8")
    print("[UPDATED] prepended \"use client\" to:", "$f")
PY
done

echo
echo "All done. Run a clean build now:"
echo "  rm -rf .next && npm run build"
