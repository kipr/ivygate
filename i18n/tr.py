import deepl
import sys
import re

# python script which pulls everything from `base.txt` and translates them
# using the deepl API. Call it like this:
# python tr.py ZH-HANS 'your-deepl-api-key-here'

out_lang = sys.argv[1]
auth_key = sys.argv[2]

# You probably need to change these
in_path = "/home/erin/Desktop/Wombat_Libraries/ivygate/i18n/base.txt"
out_path = f"/home/erin/Desktop/Wombat_Libraries/ivygate/i18n/{out_lang}.txt"

deepl_client = deepl.DeepLClient(auth_key)


def po_escape(s: str) -> str:
    """
    Make a single-line string safe to embed inside a gettext PO quoted string.

    - strips CR (in case of CRLF)
    - trims spaces just inside ASCII quotes: " 简单 " -> "简单"
    - escapes backslashes and double quotes for PO: \ -> \\ and " -> \"
    """
    s = s.replace("\r", "")
    s = re.sub(r'" *([^"]*?) *"', r'"\1"', s)
    s = s.replace("\\", "\\\\").replace('"', '\\"')
    return s


with open(in_path, "r", encoding="utf-8") as f:
    lines = [line.rstrip("\n") for line in f.readlines()]

kwargs = dict(
    target_lang=out_lang,
    source_lang="EN",
    preserve_formatting=True,
)

# DeepL does NOT support formality for Chinese
if not out_lang.upper().startswith("ZH"):
    kwargs["formality"] = "less"

result = deepl_client.translate_text(lines, **kwargs)

with open(out_path, "w", encoding="utf-8") as dest:
    for r in result:
        dest.write(po_escape(r.text) + "\n")
