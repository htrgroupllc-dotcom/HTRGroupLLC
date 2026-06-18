"""Patch TrashTab bulk delete fallback when bulk API returns 404."""
import re
from pathlib import Path

bundle = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js")
html = Path(r"C:/Projects/HTRGroupLLC/index.html")

OLD = """  const permanentDeleteBulk = async () => {
    if (!confirmBulkPerm?.length || permDeleting) return;
    setPermDeleting(true);
    setPermErr(null);
    try {
      const r2 = await fetch(`${apiBase}/api/admin/permanent-delete-bulk`, {
        method: "POST",
        headers: adminAuthH({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ids: confirmBulkPerm })
      });
      if (r2.ok) {
        const deleted = new Set(confirmBulkPerm);
        setBookings((prev) => {
          const next = prev.filter((b) => !deleted.has(b.id));
          onCountChange?.(next.length);
          return next;
        });
        setSelectedIds(/* @__PURE__ */ new Set());
        setConfirmBulkPerm(null);
      } else {
        const d = await r2.json().catch(() => ({}));
        setPermErr(d.error ?? "Error");
      }
    } catch {
      setPermErr("Connection error");
    } finally {
      setPermDeleting(false);
    }
  };"""

NEW = """  const deleteOnePermanent = async (id2) => {
    const r2 = await fetch(`${apiBase}/api/admin/permanent-delete`, {
      method: "POST",
      headers: adminAuthH({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id: id2 })
    });
    if (r2.ok) return null;
    const d = await r2.json().catch(() => ({}));
    return d.error ?? `Server error ${r2.status}`;
  };
  const permanentDeleteBulk = async () => {
    if (!confirmBulkPerm?.length || permDeleting) return;
    setPermDeleting(true);
    setPermErr(null);
    try {
      const r2 = await fetch(`${apiBase}/api/admin/permanent-delete-bulk`, {
        method: "POST",
        headers: adminAuthH({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ids: confirmBulkPerm })
      });
      if (r2.ok) {
        const deleted = new Set(confirmBulkPerm);
        setBookings((prev) => {
          const next = prev.filter((b) => !deleted.has(b.id));
          onCountChange?.(next.length);
          return next;
        });
        setSelectedIds(/* @__PURE__ */ new Set());
        setConfirmBulkPerm(null);
        return;
      }
      if (r2.status === 404) {
        const deletedIds = [];
        for (const id2 of confirmBulkPerm) {
          const errMsg = await deleteOnePermanent(id2);
          if (errMsg) {
            if (deletedIds.length > 0) {
              const partial = new Set(deletedIds);
              setBookings((prev) => {
                const next = prev.filter((b) => !partial.has(b.id));
                onCountChange?.(next.length);
                return next;
              });
              setSelectedIds((prev) => {
                const next = new Set(prev);
                deletedIds.forEach((did) => next.delete(did));
                return next;
              });
            }
            setPermErr(errMsg);
            return;
          }
          deletedIds.push(id2);
        }
        const deleted = new Set(deletedIds);
        setBookings((prev) => {
          const next = prev.filter((b) => !deleted.has(b.id));
          onCountChange?.(next.length);
          return next;
        });
        setSelectedIds(/* @__PURE__ */ new Set());
        setConfirmBulkPerm(null);
        return;
      }
      const d = await r2.json().catch(() => ({}));
      setPermErr(d.error ?? `Server error ${r2.status}`);
    } catch {
      setPermErr("Connection error");
    } finally {
      setPermDeleting(false);
    }
  };"""

text = bundle.read_text(encoding="utf-8")
if OLD not in text:
    raise SystemExit("TrashTab bulk block not found in bundle")
text = text.replace(OLD, NEW, 1)
bundle.write_text(text, encoding="utf-8", newline="\n")
html_text = html.read_text(encoding="utf-8")
html_text = re.sub(r"\?v=\d+", "?v=89", html_text)
html.write_text(html_text, encoding="utf-8", newline="\n")
print("patched v=89")
