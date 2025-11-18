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
