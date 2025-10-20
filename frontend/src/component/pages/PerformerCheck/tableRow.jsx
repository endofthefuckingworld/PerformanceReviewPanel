import { useState } from 'react';
import {
  TableRow, TableCell, IconButton, Dialog, DialogTitle, DialogContent,
  Paper, Grid, FormControl, RadioGroup, FormControlLabel, Radio, TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5159';

// 日期格式化
const fmtDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
};

// 審核狀態文字
const statusText = (isApproved) => {
  if (isApproved === true) return '通過';
  if (isApproved === false) return '未通過';
  return '未審核';
};

// label-value 格式
const KV = ({ label, children }) => (
  <div className="kv">
    <div className="kv__k">{label}</div>
    <div className="kv__v">{children ?? '-'}</div>
  </div>
);

// 將 YouTube 連結轉成可嵌入 iframe
const toYoutubeEmbed = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      const m = u.pathname.match(/\/shorts\/([\w-]+)/);
      if (m) return `https://www.youtube.com/embed/${m[1]}`;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return null;
  } catch {
    return null;
  }
};

export default function TableRows({ app, onSaved }) {
  const [open, setOpen] = useState(false);
  const [approved, setApproved] = useState(app.isApproved);
  const [reason, setReason] = useState(app.declineReason ?? '');
  const [passValue, setPassValue] = useState(
    app.isApproved === true ? 'pass' : app.isApproved === false ? 'notPass' : ''
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const performer = app.performer || {};
  const auditClassName =
    approved === true
      ? 'auditstate'
      : approved === false
      ? 'auditstate auditstate--active'
      : 'auditstate auditstate--pending';

  const handleRadio = (e) => {
    const v = e.target.value;
    setPassValue(v);
    if (v === 'pass') {
      setReason('');
      setErr(null);
    }
  };

  const saveDecision = async () => {
    try {
      setErr(null);
      if (!passValue) {
        setErr('請先選擇通過或未通過');
        return;
      }
      if (passValue === 'notPass' && !reason.trim()) {
        setErr('請輸入未通過原因');
        return;
      }

      setSaving(true);
      if (passValue === 'pass') {
        const res = await fetch(`${API}/api/applications/${app.id}/approve`, { method: 'PATCH' });
        if (!res.ok) throw new Error('伺服器回應失敗');
        setApproved(true);
        setReason('');
      } else {
        const res = await fetch(`${API}/api/applications/${app.id}/decline`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: reason.trim() }),
        });
        if (!res.ok) throw new Error('伺服器回應失敗');
        setApproved(false);
      }

      setOpen(false);
      onSaved?.();
    } catch (e) {
      setErr(e.message || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TableRow>
      <TableCell><p className={auditClassName}>{statusText(approved)}</p></TableCell>
      <TableCell>{fmtDate(app.applicationDate)}</TableCell>
      <TableCell>{performer.name ?? '-'}</TableCell>
      <TableCell>{performer.category ?? '-'}</TableCell>
      <TableCell>{app.performanceTitle ?? '-'}</TableCell>
      <TableCell align="right">
        <IconButton onClick={() => setOpen(true)}><ExpandMoreIcon /></IconButton>
      </TableCell>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth={false}
        slotProps={{
          paper: {
            sx: { width: { xs: '96vw', md: '92vw' }, maxWidth: { md: 1100, lg: 1200 } },
          },
        }}
      >
        <DialogTitle id="performerDetail">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <p style={{ margin: 0 }}>{statusText(approved)}</p>
            <span>{fmtDate(app.applicationDate)}</span>
            <span>{performer.name ?? '-'}</span>
            <span>{performer.category ?? '-'}</span>
            <span style={{ fontWeight: 600 }}>{app.performanceTitle ?? '-'}</span>
          </div>
        </DialogTitle>

        <DialogContent>
          <div className="dialogText">

            {/* ===== 上排：照片 / 資訊 / 審核 ===== */}
            <Grid container columnSpacing={4} alignItems="flex-start">
              {/* 左：表演者照片 */}
              <Grid item xs={4}>
                <Paper elevation={0}>
                  <p className="dialogTitle dialogTitle--inline">表演者照片</p>
                  <div className="mediaBox">
                    {performer.photoUrl ? (
                      <img
                        src={performer.photoUrl}
                        alt={performer.name || 'photo'}
                        className="mediaBox__img"
                      />
                    ) : (
                      <div className="mediaBox__placeholder">無照片<br />（建議 4:3）</div>
                    )}
                  </div>
                </Paper>
              </Grid>

              {/* 中：表演資訊 */}
              <Grid item xs={6}>
                <Paper elevation={0}>
                  <p className="dialogTitle dialogTitle--inline">表演資訊</p>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <KV label="表演風格">{app.style}</KV>
                      <KV label="表演費用">{app.fee}</KV>
                      <KV label="表演人數">{app.numPerformers}</KV>
                      <KV label="車馬費">{app.travelAllowance}</KV>
                    </Grid>
                    <Grid item xs={6}>
                      <KV label="表演長度">{app.durationMinutes}</KV>
                      <KV label="自有設備">{app.ownEquipment}</KV>
                      <KV label="所需設備">{app.requiredEquipment}</KV>
                      <KV label="所需場地大小">{app.requiredSpace}</KV>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* 右：審核 */}
              <Grid item xs={2}>
                <Paper elevation={0} className="auditPanel">
                  <p className="dialogTitle dialogTitle--inline">審核</p>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      name="passForm"
                      value={passValue || ''}
                      onChange={handleRadio}
                    >
                      <FormControlLabel
                        value="pass"
                        control={<Radio color="primary" size="small" />}
                        label="通過"
                      />
                      <FormControlLabel
                        value="notPass"
                        control={<Radio color="primary" size="small" />}
                        label="未通過"
                      />
                    </RadioGroup>

                    <TextField
                      label="未通過原因"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={passValue === 'pass'}
                      variant="outlined"
                      size="small"
                      margin="dense"
                      multiline
                      maxRows={4}
                      sx={{ mt: 1 }}
                    />
                    {err && <p style={{ color: 'red', fontSize: 13 }}>{err}</p>}
                    <div className="dialogActions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="btn btn--ghost" type="button" onClick={() => setOpen(false)}>關閉</button>
                      <button className="btn btn--primary" type="button" onClick={saveDecision} disabled={saving}>
                        {saving ? '儲存中…' : '儲存'}
                      </button>
                    </div>
                  </FormControl>
                </Paper>
              </Grid>
            </Grid>

            {/* ===== 下排：簡介 / 形象影片 ===== */}
            <div style={{ width: '100%', marginTop: 16 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper elevation={0}>
                    <p className="dialogTitle dialogTitle--inline">簡介</p>
                    <div className="fixedPanel introBox">
                      {performer.introduction ? (
                        <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                          {performer.introduction}
                        </pre>
                      ) : '—'}
                    </div>
                  </Paper>
                </Grid>

                {/* 形象影片固定框 */}
                <Grid item xs={8}>
                  <Paper elevation={0}>
                    <p className="dialogTitle dialogTitle--inline">形象影片</p>
                    <div className="videoBox">
                      {app.videoUrl ? (
                        (() => {
                          const embed = toYoutubeEmbed(app.videoUrl);
                          return embed ? (
                            <iframe
                              src={embed}
                              title="形象影片"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          ) : (
                            <div className="videoBox__placeholder">
                              非 YouTube 連結：<br />
                              <a href={app.videoUrl} target="_blank" rel="noreferrer">{app.videoUrl}</a>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="videoBox__placeholder">—</div>
                      )}
                    </div>
                  </Paper>
                </Grid>
              </Grid>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </TableRow>
  );
}

