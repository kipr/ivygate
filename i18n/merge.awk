# awk script to merge a machine translated file (using `tr.py`) with its PO
# file. Once you have the translated file, you call the script like this:
# awk -f merge.awk -v tl=DE.txt po/de-DE.po >de-DE.po
# Inspect the resulting file to make sure everything lined up correctly, then
# move it into the `po/` directory.

function escape_po(line) {
    gsub(/\r/, "", line)
    gsub(/\\/, "\\\\", line)
    gsub(/"/, "\\\"", line)
    return line
}

# Match any single-line msgstr "...."
# (won't handle multi-line msgstr blocks; see note below)
/^[[:space:]]*msgstr[[:space:]]*"/ {
    if ((getline line < tl) <= 0) {
        # if we run out of translations, keep original
        print
        next
    }
    printf "msgstr \"%s\"\n", escape_po(line)
    next
}

{ print }