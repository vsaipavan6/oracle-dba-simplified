
import re

path = r'C:\Users\vsaip\my-project\tablespace-management.html'

with open(path, 'rb') as f:
    data = f.read()

original_size = len(data)

# ── Fix 1: <fn>FUNCNAME</fn> → <span class="fn">FUNCNAME</span>
# These bare HTML tags won't pick up the CSS .fn colour rule
data = data.replace(b'<fn>', b'<span class="fn">')
data = data.replace(b'</fn>', b'</span>')

# ── Fix 2: SVG Layer 5 DATA BLOCK description text overflows
# Old: long description starting x=250 runs past L5 label at x=700
# Fix: shorten text so it fits within x=250..690 (at font-size 11, ~67 chars max)
old_svg_text = (
    b'<text x="250" y="492" fill="#94a3b8" font-size="11">'
    b'Smallest I/O unit \xe2\x80\x94 default 8KB. Contains row data, block header, free space. Set by DB_BLOCK_SIZE.</text>'
)
new_svg_text = (
    b'<text x="250" y="492" fill="#94a3b8" font-size="11">'
    b'Smallest I/O unit \xe2\x80\x94 default 8KB. Set by DB_BLOCK_SIZE (set at DB creation, cannot change).</text>'
)
data = data.replace(old_svg_text, new_svg_text)

# ── Fix 3: move L5 label slightly left so it can't clip outside rect
# rect goes x=105 to x=755; keep L5 at x=690 to avoid any overflow
data = data.replace(
    b'<text x="700" y="492" fill="#38bdf8" font-size="22" font-weight="800" font-family="Sora, sans-serif">L5</text>',
    b'<text x="688" y="492" fill="#38bdf8" font-size="22" font-weight="800" font-family="Sora, sans-serif">L5</text>'
)

with open(path, 'wb') as f:
    f.write(data)

fn_fixes = original_size  # placeholder count
fn_count = data.count(b'<span class="fn">')
print(f'Done. <span class="fn"> occurrences now: {fn_count}')
print(f'File size: {len(data):,} bytes')
