import { useEffect, useState } from "react";
import { getJSON, postJSON } from "../../../lib/http";   // ← 確認路徑，如果 http.js 在 src/lib/http.js

import {
  Form,
  Field,
  Input,
  NumberInput,
  DateTimeInput,
  Textarea,
  Select,
  Actions,
  Button,
  GhostButton,
} from "../../form/Form";  // ← 確認你的 Form 元件放的位置

const noSec = (dateLike = new Date()) => {
  const d = new Date(dateLike);
  d.setSeconds(0, 0);
  return d;
};

export default function ApplicationCreate() {
  const [performers, setPerformers] = useState([]);
  const [form, setForm] = useState({
    performerId: "",
    performanceTitle: "",
    applicationDate: new Date().toISOString(),
    style: "",
    fee: 0,
    durationMinutes: 60,
    ownEquipment: "",
    numPerformers: 1,
    requiredEquipment: "",
    travelAllowance: 0,
    requiredSpace: "",
    videoUrl: "",
  });
  const [err, setErr] = useState({});
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  // 載入表演者清單
  useEffect(() => {
    getJSON("/api/performers")
      .then(setPerformers)
      .catch((e) => setMsg(`載入表演者失敗：${e.message}`));
  }, []);

  const set = (k) => (v) =>
    setForm({ ...form, [k]: v?.target ? v.target.value : v });

  function validate() {
    const e = {};
    if (!form.performerId) e.performerId = "必選";
    if (!form.performanceTitle) e.performanceTitle = "必填";
    if (!form.style) e.style = "必填";
    if (!form.ownEquipment) e.ownEquipment = "必填";
    if (!form.requiredEquipment) e.requiredEquipment = "必填";
    if (!form.requiredSpace) e.requiredSpace = "必填";
    return e;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    const v = validate();
    setErr(v);
    if (Object.keys(v).length) return;

    try {
      setSaving(true);
      await postJSON("/api/applications", {
        id: 0,
        performerId: Number(form.performerId),
        performanceTitle: form.performanceTitle,
        applicationDate: noSec(form.performanceDate),   // 後端 ApplicationDate: DateTime
        style: form.style,
        fee: Number(form.fee),
        durationMinutes: Number(form.durationMinutes),
        ownEquipment: form.ownEquipment,
        numPerformers: Number(form.numPerformers),
        requiredEquipment: form.requiredEquipment,
        travelAllowance: Number(form.travelAllowance),
        requiredSpace: form.requiredSpace,
        videoUrl: form.videoUrl || null,         // 可空
      });
      setMsg("新增申請成功！");
      // 清空表單
      setForm({
        performerId: "",
        performanceTitle: "",
        applicationDate: new Date(),
        style: "",
        fee: 0,
        durationMinutes: 60,
        ownEquipment: "",
        numPerformers: 1,
        requiredEquipment: "",
        travelAllowance: 0,
        requiredSpace: "",
        videoUrl: "",
      });
      setErr({});
    } catch (ex) {
      setMsg(`新增失敗：${ex.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2>新增表演</h2>
      <Form onSubmit={onSubmit}>
        <Field label="表演者" required error={err.performerId}>
          <Select
            value={form.performerId}
            onChange={set("performerId")}
          >
            <option value="">請選擇</option>
            {performers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}（{p.category}）
              </option>
            ))}
          </Select>
        </Field>

        <Field label="表演名稱" required error={err.performanceTitle}>
          <Input
            value={form.performanceTitle}
            onChange={set("performanceTitle")}
            placeholder="例如：Terry's World Tour"
          />
        </Field>

        <Field label="表演日期" required>
          <DateTimeInput
            value={form.applicationDate}
            onChange={(v) => setForm({ ...form, applicationDate: v })}
          />
        </Field>

        <Field label="表演風格" required error={err.style}>
          <Input value={form.style} onChange={set("style")} />
        </Field>

        <Field label="表演費用">
          <NumberInput value={form.fee} onChange={set("fee")} min={0} />
        </Field>

        <Field label="表演長度（分鐘）">
          <NumberInput
            value={form.durationMinutes}
            onChange={set("durationMinutes")}
            min={1}
          />
        </Field>

        <Field label="自有設備" required error={err.ownEquipment}>
          <Input value={form.ownEquipment} onChange={set("ownEquipment")} />
        </Field>

        <Field label="表演人數">
          <NumberInput
            value={form.numPerformers}
            onChange={set("numPerformers")}
            min={1}
          />
        </Field>

        <Field label="所需設備" required error={err.requiredEquipment}>
          <Input
            value={form.requiredEquipment}
            onChange={set("requiredEquipment")}
          />
        </Field>

        <Field label="車馬費">
          <NumberInput
            value={form.travelAllowance}
            onChange={set("travelAllowance")}
            min={0}
          />
        </Field>

        <Field label="所需場地大小" required error={err.requiredSpace}>
          <Input
            value={form.requiredSpace}
            onChange={set("requiredSpace")}
          />
        </Field>

        <Field label="形象影片（YouTube連結，可空）">
          <Input
            type="url"
            value={form.videoUrl}
            onChange={set("videoUrl")}
            placeholder="https://youtube.com/..."
          />
        </Field>

        <Actions>
          <Button type="submit" disabled={saving}>
            {saving ? "送出中…" : "送出"}
          </Button>
          <GhostButton
            type="button"
            onClick={() =>
              setForm({
                performerId: "",
                performanceTitle: "",
                applicationDate: new Date().toISOString(),
                style: "",
                fee: 0,
                durationMinutes: 60,
                ownEquipment: "",
                numPerformers: 1,
                requiredEquipment: "",
                travelAllowance: 0,
                requiredSpace: "",
                videoUrl: "",
              })
            }
          >
            清空
          </GhostButton>
        </Actions>
        {msg && <div>{msg}</div>}
      </Form>
    </div>
  );
}