import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';
import type { RequirementWithUpdate, Requirement, Update } from './types';
import EditModal from './components/EditModal';

type SetorOption = { value: string; label: string };

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

async function fetchSetores(): Promise<string[]> {
  const { data, error } = await supabase
    .from('requirements')
    .select('setor_executor', { count: 'exact', head: false });
  if (error) throw error;
  const uniq = Array.from<string>(
    new Set((data ?? []).map((r: any) => (r.setor_executor as string)))
  ).sort();
  return uniq;
}

async function fetchRequirementsForSetor(setor: string): Promise<RequirementWithUpdate[]> {
  const { data: reqs, error } = await supabase
    .from('requirements')
    .select('*')
    .eq('setor_executor', setor)
    .order('eixo', { ascending: true })
    .order('subitem', { ascending: true });

  if (error) throw error;

  const ids = (reqs ?? []).map((r: any) => r.id as string);
  if (ids.length === 0) return [];

  const { data: ups, error: uerr } = await supabase
    .from('updates')
    .select('*')
    .in('requirement_id', ids);

  if (uerr) throw uerr;

  const upByReq = new Map<string, any>((ups ?? []).map((u: any) => [u.requirement_id as string, u]));
  return (reqs ?? []).map((r: any) => ({ ...(r as Requirement), update: upByReq.get(r.id as string) || null }));
}

async function saveUpdate(payload: { requirement_id: string; status: Update['status']; evidencia_url?: string; observacoes?: string }) {
  const { data, error } = await supabase
    .from('updates')
    .upsert({ ...payload }, { onConflict: 'requirement_id' })
    .select()
    .single();
  if (error) throw error;
  return data as Update;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [setores, setSetores] = useState<SetorOption[]>([]);
  const [setor, setSetor] = useState<string>(() => localStorage.getItem('setor') || '');
  const [items, setItems] = useState<RequirementWithUpdate[]>([]);
  const [editing, setEditing] = useState<RequirementWithUpdate | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const s = await fetchSetores();
        setSetores(s.map(v => ({ value: v, label: v })));
        if (setor) {
          const data = await fetchRequirementsForSetor(setor);
          setItems(data);
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
      const data = await fetchRequirementsForSetor(setor);
      setItems(data);
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
      const up = await saveUpdate(update);
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
