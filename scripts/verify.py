from pathlib import Path
import re
b=Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v3.js").read_bytes()
samples=["Пароль","Войти","Управление расписанием","Ошибка соединения","Подтверждён"]
for s in samples:
    u=s.encode("utf-8")
    m=u.decode("latin-1").encode("utf-8")
    Path(r"C:\Projects\HTRGroupLLC\scripts\verify.txt").open("a", encoding="utf-8").write(f"{s}: utf8={u in b} moji={m in b}\n")
