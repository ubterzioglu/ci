#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/assets/images"
mkdir -p "$OUT_DIR"
python3 - <<'PYASSET' > /tmp/cineocucina_assets.tsv
import json, pathlib, re
p = pathlib.Path('content/assets/image-assets.json')
if not p.exists():
    p = pathlib.Path.cwd() / 'content/assets/image-assets.json'
items=json.loads(p.read_text(encoding='utf-8'))
for item in items:
    url=item['url']; ext='.jpg'
    m=re.search(r'\.(png|jpe?g|webp)(?:/|\?|$)', url, re.I)
    if m:
        e=m.group(1).lower(); ext='.jpg' if e in ('jpg','jpeg') else '.'+e
    print(f"{item['id']}{ext}	{url}")
PYASSET
while IFS=$'	' read -r filename url; do
  target="$OUT_DIR/$filename"
  echo "Downloading $filename"
  if command -v curl >/dev/null 2>&1; then
    curl -L --fail --silent --show-error "$url" -o "$target" || echo "FAILED: $url"
  elif command -v wget >/dev/null 2>&1; then
    wget -q -O "$target" "$url" || echo "FAILED: $url"
  else
    echo "curl veya wget gerekli"; exit 1
  fi
done < /tmp/cineocucina_assets.tsv
echo "Done. Images are in $OUT_DIR"
