import shutil
from pathlib import Path
import re

matches = []
for p in Path("src").rglob("*.tsx"):
    text = p.read_text(encoding="utf-8", errors="ignore")
    if re.search(r'from\s+["\']next/navigation["\']', text):
        matches.append(p)

if not matches:
    print("No files importing next/navigation found under src/.")
else:
    print("Found", len(matches), "files. Processing...")
    for p in matches:
        bak = p.with_suffix(p.suffix + ".bak")
        if not bak.exists():
            shutil.copy2(p, bak)
        text = p.read_text(encoding="utf-8")
        if text.startswith("\ufeff"):
            text = text.lstrip("\ufeff")
        stripped = text.lstrip("\r\n\t ")
        first_line = stripped.splitlines()[0] if stripped.splitlines() else ""
        if first_line.strip() == '"use client";':
            print(f"[OK] {p} already has \"use client\".")
            continue
        new_text = "\"use client\";\n" + stripped
        p.write_text(new_text, encoding="utf-8")
        print(f"[UPDATED] prepended \"use client\" to {p} (backup -> {bak})")
print("Done.")
