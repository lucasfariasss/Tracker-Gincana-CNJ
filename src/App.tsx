import React, { useEffect, useMemo, useState } from 'react';
import type { RequirementWithUpdate, Requirement, Update } from './types';
import EditModal from './components/EditModal';

type SetorOption = { value: string; label: string };

// ===== Utilitários de CSV e formatação (sem dependências externas) =====

function parseDateBR(d?: string | null) {
  if (!d) return null;
  const iso = new Date(d);
  if (!Number.isNaN(iso.getTime())) return iso.toISOString().slice(0, 10);
  const m = d.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (m) {
    const [_, dd, mm, yyyy] = m;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).toISOString().slice(0, 10);
  }
  return null;
}

function parseNumberBR(n?: string | number) {
  if (n == null) return 0;
  if (typeof n === 'number') return n;
  const s = n.replace(/\./g, '').replace(',', '.').trim();
  const f = parseFloat(s);
  return Number.isNaN(f) ? 0 : f;
}

function csvToRows(text: string): Record<string, string>[] {
  const sep = text.includes(';') && !text.includes(',') ? ';' : ',';
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);

  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQ = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQ = !inQ; }
      } else if (ch === sep && !inQ) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map(s => s.trim());
  };

  if (lines.length === 0) return [];
  const header = parseLine(lines[0]);
  return lines.slice(1).map(l => {
    const cols = parseLine(l);
    const obj: Record<string, string> = {};
    header.forEach((h, i) => { obj[h] = cols[i] ?? ''; });
    return obj;
  });
}

function formatDate(d?: string | null) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
}

function daysUntil(d?: string | null) {
  if (!d) return Infinity;
  const now = new Date();
  const target = new Date(d);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function statusColor(s?: Update['status']) {
  switch (s) {
    case 'concluido': return '#16a34a';
    case 'em_andamento': return '#2563eb';
    default: return '#6b7280';
  }
}

function eixoColor(eixo: string) {
  const map: Record<string, string> = {
    'Governança': '#2563eb',
    'Produtividade': '#16a34a',
    'Dados': '#7c3aed',
    'Transparência': '#f59e0b'
  };
  return map[eixo] ?? '#334155';
}

const DEADLINE_ALERT_DAYS = 15;

// ===== Persistência local (localStorage) =====

function makeId(r: Pick<Requirement, 'setor_executor' | 'eixo' | 'item' | 'subitem'>) {
  const key = `${r.setor_executor}||${r.eixo}||${r.item}||${r.subitem}`;
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = ((h << 5) + h) + key.charCodeAt(i);
  return `req_${(h >>> 0).toString(16)}`;
}

const UPDATES_KEY = 'premio_cnj_updates_v1';

function loadUpdates(): Record<string, Update> {
  try {
    const raw = localStorage.getItem(UPDATES_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw) as Record<string, Update>;
    return obj ?? {};
  } catch {
    return {};
  }
}

function saveUpdateLocal(update: Update) {
  const all = loadUpdates();
  all[update.requirement_id] = update;
  localStorage.setItem(UPDATES_KEY, JSON.stringify(all));
}

async function fetchCSVRequirements(): Promise<Requirement[]> {
  try {
    const res = await fetch('/data/BD.csv', { cache: 'no-cache' });
    if (!res.ok) throw new Error('CSV não encontrado');
    const text = await res.text();
    const rows = csvToRows(text);
    const list: Requirement[] = rows.map((r: Record<string, string>) => {
      const setor = (r['Setor Executor'] ?? '').trim();
      const eixo = (r['EIXO'] ?? '').trim();
      const item = (r['ITEM'] ?? '').trim();
      const subitem = (r['SUBITEM'] ?? '').trim();
      const deadline = parseDateBR(r['DEADLINE']);
      const pontos = parseNumberBR(r['Pontos Aplicáveis 2025']);
      const id = makeId({ setor_executor: setor, eixo, item, subitem });
      return { id, setor_executor: setor, eixo, item, subitem, deadline, pontos: Number(pontos) || 0 };
    }).filter(r => r.setor_executor && r.eixo && r.item && r.subitem);
    if (list.length > 0) return list;
    throw new Error('CSV vazio');
  } catch {
    const sample: Requirement[] = [
      {
        id: makeId({ setor_executor: 'Setor Exemplo', eixo: 'Governança', item: 'Exemplo de Meta', subitem: 'Subitem 1' }),
        setor_executor: 'Setor Exemplo',
        eixo: 'Governança',
        item: 'Exemplo de Meta',
        subitem: 'Subitem 1',
        deadline: parseDateBR('31/12/2026'),
        pontos: 10
      },
      {
        id: makeId({ setor_executor: 'Setor Exemplo', eixo: 'Produtividade', item: 'Outra Meta', subitem: 'Subitem 2' }),
        setor_executor: 'Setor Exemplo',
        eixo: 'Produtividade',
        item: 'Outra Meta',
        subitem: 'Subitem 2',
        deadline: parseDateBR('30/11/2026'),
        pontos: 5
      }
    ];
    return sample;
  }
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [setores, setSetores] = useState<SetorOption[]>([]);
  const [setor, setSetor] = useState<string>(() => localStorage.getItem('setor') || '');
  const [allItems, setAllItems] = useState<Requirement[]>([]);
  const [items, setItems] = useState<RequirementWithUpdate[]>([]);
  const [editing, setEditing] = useState<RequirementWithUpdate | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const reqs = await fetchCSVRequirements();
        setAllItems(reqs);
        const uniqSetores = Array.from(new Set(reqs.map(r => r.setor_executor))).sort();
        setSetores(uniqSetores.map(v => ({ value: v, label: v })));
        if (setor) {
          const ups = loadUpdates();
          const filtered = reqs.filter(r => r.setor_executor === setor)
            .map(r => ({ ...r, update: ups[r.id] ?? null }));
          setItems(filtered);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function enter() {
    if (!setor) return;
    localStorage.setItem('setor', setor);
    setLoading(true);
    try {
      const ups = loadUpdates();
      const filtered = allItems.filter(r => r.setor_executor === setor)
        .map(r => ({ ...r, update: ups[r.id] ?? null }));
      setItems(filtered);
    } finally {
      setLoading(false);
    }
  }

  const totals = useMemo(() => {
    const total = items.reduce((acc: number, r: RequirementWithUpdate) => acc + (Number(r.pontos) || 0), 0);
    const done = items
      .filter((r: RequirementWithUpdate) => r.update?.status === 'concluido')
      .reduce((acc: number, r: RequirementWithUpdate) => acc + (Number(r.pontos) || 0), 0);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pct };
  }, [items]);

  const grouped = useMemo(() => {
    const m = new Map<string, RequirementWithUpdate[]>();
    for (const it of items) {
      const k = it.eixo || 'Outros';
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(it);
    }
    return Array.from(m.entries());
  }, [items]);

  async function handleSave(update: { requirement_id: string; status: Update['status']; evidencia_url?: string; observacoes?: string }) {
    setSaving(true);
    try {
      const up: Update = {
        id: update.requirement_id,
        requirement_id: update.requirement_id,
        status: update.status,
        evidencia_url: update.evidencia_url ?? null,
        observacoes: update.observacoes ?? null,
        updated_at: new Date().toISOString()
      };
      saveUpdateLocal(up);
      setItems((prev: RequirementWithUpdate[]) => prev.map((r: RequirementWithUpdate) => r.id === up.requirement_id ? { ...r, update: up } : r));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  if (!setor) {
    return (
      <div className="container">
        <div className="card login">
          <h1>Prêmio CNJ de Qualidade - TJPB 2026</h1>
          <p className="subtitle">Qual é o seu Setor?</p>
          {loading ? <p>Carregando…</p> : (
            <>
              <select value={setor} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSetor(e.target.value)}>
                <option value="" disabled>Selecione seu Setor</option>
                {setores.map((s: SetorOption) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <button disabled={!setor} onClick={enter}>Entrar</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="left">
          <h2>{setor}</h2>
          <small>{items.length} itens</small>
        </div>
        <div className="progress">
          <div className="progress-label">
            Progresso do Setor: {totals.pct}% ({totals.done}/{totals.total} pts)
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${totals.pct}%` }} />
          </div>
        </div>
        <div className="right">
          <button className="outline" onClick={() => { localStorage.removeItem('setor'); location.reload(); }}>Trocar Setor</button>
        </div>
      </header>

      {loading ? <p className="pad">Carregando…</p> : (
        <div className="groups">
          {grouped.map(([eixo, arr]) => (
            <section key={eixo} className="group">
              <div className="group-title" style={{ borderLeftColor: eixoColor(eixo) }}>
                <h3>{eixo}</h3>
                <span className="badge" style={{ background: eixoColor(eixo) }}>{arr.length}</span>
              </div>
              <div className="cards">
                {arr.map(r => {
                  const du = daysUntil(r.deadline);
                  const near = du <= DEADLINE_ALERT_DAYS && (r.update?.status !== 'concluido');
                  return (
                    <div key={r.id} className="card item" onClick={() => setEditing(r)}>
                      <div className="item-header">
                        <div className="item-title">{r.subitem}</div>
                        <div className="status-badge" style={{ background: statusColor(r.update?.status) }}>
                          {r.update?.status === 'concluido' ? 'Concluído' :
                           r.update?.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'}
                        </div>
                      </div>
                      <div className="item-row"><span className="label">Meta:</span> {r.item}</div>
                      <div className="item-row">
                        <span className="label">Prazo:</span>
                        <span className={near ? 'deadline danger' : 'deadline'}>{formatDate(r.deadline)}</span>
                      </div>
                      <div className="item-row"><span className="label">Pontos:</span> {r.pontos}</div>
                      {r.update?.evidencia_url ? (
                        <div className="item-row">
                          <span className="label">Evidência:</span>
                          <a href={r.update.evidencia_url} target="_blank" onClick={(e) => e.stopPropagation()} rel="noreferrer">Abrir</a>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {editing && (
        <EditModal
          open={!!editing}
          onClose={() => setEditing(null)}
          saving={saving}
          requirement={editing}
          onSave={(payload) => handleSave(payload)}
        />
      )}
    </div>
  );
}
