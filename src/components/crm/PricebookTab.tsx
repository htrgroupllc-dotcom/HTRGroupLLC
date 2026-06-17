import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Check, X, Tag } from "lucide-react";

const ACCENT = "#1B6FE8";

interface PricebookItem {
  id: number;
  name: string;
  description: string | null;
  category: string;
  unit_price: number;
  active: boolean;
  created_at: string;
}

interface Props {
  apiBase: string;
  adminAuthH: () => Record<string, string>;
}

const CATEGORIES = ["Labor", "Part", "Material"];

const CAT_COLOR: Record<string, string> = {
  Labor:    "#1B6FE8",
  Part:     "#16a34a",
  Material: "#d97706",
};

function Badge({ cat }: { cat: string }) {
  const color = CAT_COLOR[cat] ?? "#64748b";
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      background: `${color}18`, color, fontSize: 11, fontWeight: 700,
    }}>{cat}</span>
  );
}

const EMPTY = { name: "", description: "", category: "Labor", unit_price: "", active: true };
type FormState = typeof EMPTY;

export default function PricebookTab({ apiBase, adminAuthH }: Props) {
  const [items, setItems]       = useState<PricebookItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filterCat, setFilterCat] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<PricebookItem | null>(null);
  const [form, setForm]         = useState<FormState>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${apiBase}/api/admin/pricebook`, { headers: adminAuthH() });
      const d = await r.json() as { ok?: boolean; items?: PricebookItem[] };
      setItems(d.items ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [apiBase, adminAuthH]);

  useEffect(() => { void load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setErr("");
    setShowForm(true);
  };

  const openEdit = (item: PricebookItem) => {
    setEditing(item);
    setForm({
      name:        item.name,
      description: item.description ?? "",
      category:    item.category,
      unit_price:  String(item.unit_price),
      active:      item.active,
    });
    setErr("");
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim()) { setErr("Название обязательно"); return; }
    const price = parseFloat(form.unit_price);
    if (isNaN(price) || price < 0) { setErr("Введите корректную цену"); return; }
    setSaving(true);
    setErr("");
    try {
      const body = {
        name:        form.name.trim(),
        description: form.description.trim() || null,
        category:    form.category,
        unit_price:  price,
        active:      form.active,
      };
      const url    = editing ? `${apiBase}/api/admin/pricebook/${editing.id}` : `${apiBase}/api/admin/pricebook`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { ...adminAuthH(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("Ошибка сохранения");
      setShowForm(false);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Удалить позицию из прайс-листа?")) return;
    setDeletingId(id);
    try {
      await fetch(`${apiBase}/api/admin/pricebook/${id}`, {
        method: "DELETE", headers: adminAuthH(),
      });
      await load();
    } finally { setDeletingId(null); }
  };

  const visible = items.filter(i => filterCat === "All" || i.category === filterCat);
  const grouped = CATEGORIES.reduce<Record<string, PricebookItem[]>>((acc, cat) => {
    acc[cat] = visible.filter(i => i.category === cat);
    return acc;
  }, {});

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            Прайс-лист услуг
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{items.length} позиций · Работник выбирает из списка при создании эстимейта</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: ACCENT }}
        >
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {["All", ...CATEGORIES].map(c => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              filterCat === c
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-stone-200 text-stone-500 bg-white hover:border-stone-300"
            }`}
          >
            {c === "All" ? "Все" : c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Загрузка...</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Прайс-лист пустой. Добавьте первую позицию.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map(cat => {
            const grp = grouped[cat] ?? [];
            if (!grp.length) return null;
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge cat={cat} />
                  <span className="text-xs text-slate-400">{grp.length} поз.</span>
                </div>
                <div className="space-y-2">
                  {grp.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border bg-white transition ${
                        item.active ? "border-slate-100 hover:border-slate-200" : "border-dashed border-slate-200 opacity-50"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-800 truncate">{item.name}</span>
                          {!item.active && <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Выкл</span>}
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-base text-slate-800">${Number(item.unit_price).toFixed(2)}</div>
                        <div className="text-xs text-slate-400">за ед.</div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => void del(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)" }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base text-slate-800">
                {editing ? "Редактировать позицию" : "Новая позиция"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-full hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Название *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Диагностика, Замена термостата..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Описание</label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Краткое описание (необязательно)"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Категория</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Цена ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.unit_price}
                    onChange={e => setForm(f => ({ ...f, unit_price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className={`w-10 h-6 rounded-full transition-colors ${form.active ? "bg-green-500" : "bg-slate-300"} flex items-center`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white shadow mx-0.5 transition-transform ${form.active ? "translate-x-4" : ""}`} />
                </button>
                <span className="text-sm text-slate-600">Активна (доступна работникам)</span>
              </div>

              {err && <p className="text-xs text-red-500">{err}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Отмена
                </button>
                <button
                  onClick={() => void save()}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5"
                  style={{ background: ACCENT, opacity: saving ? 0.7 : 1 }}
                >
                  <Check className="w-4 h-4" />
                  {saving ? "Сохраняем..." : "Сохранить"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
