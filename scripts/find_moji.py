from pathlib import Path
b=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").read_bytes()
moji=b'\xc3\x90\xc2\x9d\xc3\x90\xc2\xb5\xc3\x90\xc2\xb2\xc3\x90\xc2\xb5\xc3\x91\xc2\x80\xc3\x90\xc2\xbd\xc3\x91\xc2\x8b\xc3\x90\xc2\xb9'
idx=0
while True:
    i=b.find(moji, idx)
    if i<0: break
    ctx=b[max(0,i-50):i+len(moji)+50]
    Path(r"C:\Projects\HTRGroupLLC\scripts\ctx.txt").write_bytes(ctx+b"\n")
    idx=i+1
Path(r"C:\Projects\HTRGroupLLC\scripts\count.txt").write_text(str(b.count(moji)), encoding="ascii")
