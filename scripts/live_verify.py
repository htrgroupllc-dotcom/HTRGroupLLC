from pathlib import Path
b=Path(r"C:\Projects\HTRGroupLLC\scripts\live-utf8.js").read_bytes()
u="Управление расписанием".encode("utf-8")
m="Пароль".encode("utf-8").decode("latin-1").encode("utf-8")
Path(r"C:\Projects\HTRGroupLLC\scripts\live_verify.txt").write_text(f"size={len(b)}\ncyr_schedule={u in b}\nmoji_parol={m in b}", encoding="ascii")
