import React, { useEffect, useState } from 'react';
import type { RequirementWithUpdate, Update } from '../types';

type Props = {
  open: boolean;
  saving?: boolean;
  requirement: RequirementWithUpdate;
  onClose: () => void;
  onSave: (payload: { requirement_id: string; status: Update['status']; evidencia_url?: string; observacoes?: string }) => void;
};

export default function EditModal({ open, saving, requirement, onClose, onSave }: Props) {
  const [status, setStatus] = useState<Update['status']>('pendente');
  const [evidencia, setEvidencia] = useState<string>('');
  const [obs, setObs] = useState<string>('');

  useEffect(() => {
    setStatus(requirement.update?.status ?? 'pendente');
    setEvidencia(requirement.update?.evidencia_url ?? '');
    setObs(requirement.update?.observacoes ?? '');
  }, [requirement]);

  if (!open) return null;

  function submit() {
    onSave({
      requirement_id: requirement.id,
      status,
      evidencia_url: evidencia || undefined,
      observacoes: obs || undefined
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Edição: {requirement.subitem}</h3>
        <div className="form">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Update['status'])}>
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
          </select>

          <label>Link de Evidência</label>
          <input type="url" placeholder="https://..." value={evidencia} onChange={(e) => setEvidencia(e.target.value)} />

          <label>Observações</label>
          <textarea rows={4} placeholder="Digite observações..." value={obs} onChange={(e) => setObs(e.target.value)} />

          <div className="actions">
            <button className="outline" onClick={onClose}>Cancelar</button>
            <button disabled={saving} onClick={submit}>{saving ? 'Salvando…' : 'Salvar'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
