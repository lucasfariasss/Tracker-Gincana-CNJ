// Mock data para funcionar sem banco de dados no StackBlitz
export type Requirement = {
  id: string;
  setor_executor: string;
  eixo: string;
  item: string;
  subitem: string;
  deadline: string | null;
  pontos: number;
};

export type Update = {
  id: string;
  requirement_id: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  evidencia_url?: string | null;
  observacoes?: string | null;
  updated_at: string;
};

export type RequirementWithUpdate = Requirement & {
  update?: Update | null;
};

// Dados de exemplo (substitui o BD.csv)
export const mockRequirements: Requirement[] = [
  {
    id: 'req_1',
    setor_executor: 'Secretaria de Gestão Estratégica',
    eixo: 'Governança',
    item: 'Ter plano estratégico institucional vigente e publicado',
    subitem: 'Plano estratégico atualizado e publicado',
    deadline: '2026-06-30',
    pontos: 10
  },
  {
    id: 'req_2',
    setor_executor: 'Secretaria de Gestão Estratégica',
    eixo: 'Governança',
    item: 'Política de gestão de riscos aprovada e em funcionamento',
    subitem: 'Implementar política de gestão de riscos',
    deadline: '2026-12-31',
    pontos: 15
  },
  {
    id: 'req_3',
    setor_executor: 'Secretaria de Gestão Estratégica',
    eixo: 'Governança',
    item: 'Sistema de controle interno implementado',
    subitem: 'Controle interno operacional',
    deadline: '2026-09-30',
    pontos: 12
  },
  {
    id: 'req_4',
    setor_executor: 'Coordenadoria de Estatística',
    eixo: 'Produtividade',
    item: 'Cumprir pelo menos 90% das metas estabelecidas',
    subitem: 'Atingir meta de produtividade judicial',
    deadline: '2026-12-31',
    pontos: 20
  },
  {
    id: 'req_5',
    setor_executor: 'Coordenadoria de Estatística',
    eixo: 'Produtividade',
    item: 'Reduzir em 30% processos com mais de 5 anos',
    subitem: 'Redução de acervo de processos antigos',
    deadline: '2026-11-30',
    pontos: 25
  },
  {
    id: 'req_6',
    setor_executor: 'Coordenadoria de Estatística',
    eixo: 'Produtividade',
    item: 'Implementar ferramenta de gestão processual',
    subitem: 'Sistema de gestão de processos',
    deadline: '2026-08-31',
    pontos: 18
  },
  {
    id: 'req_7',
    setor_executor: 'Assessoria de Comunicação',
    eixo: 'Transparência',
    item: 'Portal com dados atualizados e acessíveis',
    subitem: 'Manter portal atualizado mensalmente',
    deadline: '2026-12-31',
    pontos: 12
  },
  {
    id: 'req_8',
    setor_executor: 'Assessoria de Comunicação',
    eixo: 'Transparência',
    item: 'Publicar relatórios trimestrais de atividades',
    subitem: 'Relatórios de transparência ativa',
    deadline: '2026-12-31',
    pontos: 10
  },
  {
    id: 'req_9',
    setor_executor: 'Diretoria de TI',
    eixo: 'Dados',
    item: 'Todos os processos novos digitalizados',
    subitem: '100% dos processos em meio eletrônico',
    deadline: '2026-06-30',
    pontos: 30
  },
  {
    id: 'req_10',
    setor_executor: 'Diretoria de TI',
    eixo: 'Dados',
    item: 'Sistema de Business Intelligence implementado',
    subitem: 'Dashboard de indicadores estratégicos',
    deadline: '2026-10-31',
    pontos: 22
  },
  {
    id: 'req_11',
    setor_executor: 'Diretoria de TI',
    eixo: 'Dados',
    item: 'Proteção de dados pessoais conforme LGPD',
    subitem: 'Conformidade com LGPD',
    deadline: '2026-07-31',
    pontos: 20
  }
];

// Persistência local (localStorage)
const UPDATES_KEY = 'premio_cnj_updates_v1';

export function loadUpdates(): Record<string, Update> {
  try {
    const raw = localStorage.getItem(UPDATES_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw) as Record<string, Update>;
    return obj ?? {};
  } catch {
    return {};
  }
}

export function saveUpdateLocal(update: Update): void {
  const all = loadUpdates();
  all[update.requirement_id] = update;
  localStorage.setItem(UPDATES_KEY, JSON.stringify(all));
}

export function getAllSectors(): string[] {
  const sectors = new Set(mockRequirements.map(r => r.setor_executor));
  return Array.from(sectors).sort();
}

export function getRequirementsBySector(sector: string): RequirementWithUpdate[] {
  const updates = loadUpdates();
  return mockRequirements
    .filter(r => r.setor_executor === sector)
    .map(r => ({ ...r, update: updates[r.id] ?? null }));
}
