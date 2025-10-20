import { useState, useEffect } from "react";
import { postJSON } from "../../../lib/http";
import { Form, Field, Input, Textarea, Select, Actions, Button, GhostButton } from "../../form/Form";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
const CATEGORIES = [
  "pop",
  "rock",
  "country",
  "jazz",
  "hip-hop",
  "dance",
  "magic",
  "variety"
];

export default function PerformerCreate() {
  const [form, setForm] = useState({ name:"", category:"", photoUrl:"", introduction:"" });
  const [err, setErr] = useState({});
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (msg) setOpen(true);
  }, [msg]);

  const handleClose = () => {
    setOpen(false);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function validate() {
    const e = {};
    if (!form.name) e.name = "必填";
    const categoryToSend = form.category === "__other__"
      ? (customCategory ?? "").trim()
      : (form.category ?? "").trim();
    if (!form.category || (form.category === "__other__" && !customCategory)) e.category = "必填";
    if (categoryToSend.length > 1000) {
      e.category = "長度不可超過 1000 字";
    }
    if (!form.photoUrl) e.photoUrl = "必填";
    if (!form.introduction) e.introduction = "必填";
    return { e, categoryToSend };
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setMsg(null);
    const { e, categoryToSend } = validate();
    setErr(e);
    if (Object.keys(e).length) return;
    try {
      setSaving(true);
      await postJSON("/api/performers", {
        id: 0,
        name: form.name,
        category: categoryToSend,
        photoUrl: form.photoUrl,
        introduction: form.introduction,
        applications: []
      });
      setMsg("新增表演者成功！");
      setForm({ name:"", category:"", photoUrl:"", introduction:"" });
      setErr({});
    } catch (ex) {
      setMsg(`新增失敗：${ex.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2>新增表演者</h2>
      <Form onSubmit={onSubmit}>
        <Field label="表演者名稱" required error={err.name}>
          <Input value={form.name} onChange={set("name")} placeholder="例如：Terry" />
        </Field>
        <Field label="類別" required error={err.category}>
          <Select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">請選擇類別</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__other__">其他（自訂）</option>
          </Select>

          {form.category === "__other__" && (
            <div style={{ marginTop: 8 }}>
              <Input
                placeholder="請輸入自訂類別"
                value={customCategory}
                onChange={(e)=> setCustomCategory(e.target.value)}
              />
            </div>
          )}
        </Field>
        <Field label="照片連結（URL）" required error={err.photoUrl} hint="請貼圖片 URL（必須為 http/https）">
          <Input type="url" value={form.photoUrl} onChange={set("photoUrl")} placeholder="https://…" />
        </Field>
        <Field label="簡介" required error={err.introduction}>
          <Textarea value={form.introduction} onChange={set("introduction")} />
        </Field>
        <Actions>
          <Button type="submit" disabled={saving}>{saving ? "送出中…" : "送出"}</Button>
          <GhostButton type="button" onClick={() => setForm({ name:"", category:"", photoUrl:"", introduction:"" })}>清空</GhostButton>
        </Actions>
        <Snackbar
          open={open}
          autoHideDuration={4500}  // 4.5秒後自動消失
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MuiAlert
            onClose={handleClose}
            severity={msg?.includes("失敗") ? "error" : "success"} // 根據內容判斷成功/失敗
            sx={{ width: '100%' }}
          >
            {msg}
          </MuiAlert>
        </Snackbar>
      </Form>
    </div>
  );
}