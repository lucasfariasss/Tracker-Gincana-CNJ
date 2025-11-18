import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

// Requer variáveis de ambiente:
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Coloque o arquivo CSV em data/BD.csv (com cabeçalhos exatos)

type Row = {
  'Setor Executor': string;
  'EIXO': string;
  'ITEM': string;
  'SUBITEM': string;
  'DEADLINE'?: string;
  'Pontos Aplicáveis 2025'?: string | number;
};

function parseDateBR(d?: string) {
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

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  const csvPath = path.resolve('data', 'BD.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`Arquivo não encontrado: ${csvPath}`);
    process.exit(1);
  }
  const buf = fs.readFileSync(csvPath, 'utf-8');

  const rows = parse(buf, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true
  }) as Row[];

  const batch = rows.map((r) => ({
    setor_executor: r['Setor Executor']?.trim(),
    eixo: r['EIXO']?.trim(),
    item: r['ITEM']?.trim(),
    subitem: r['SUBITEM']?.trim(),
    deadline: parseDateBR(r['DEADLINE']),
    pontos: parseNumberBR(r['Pontos Aplicáveis 2025'])
  })).filter(r =>
    r.setor_executor && r.eixo && r.item && r.subitem
  );

  console.log(`Importando ${batch.length} linhas...`);
  const chunkSize = 1000;
  for (let i = 0; i < batch.length; i += chunkSize) {
    const slice = batch.slice(i, i + chunkSize);
    const { error } = await supabase.from('requirements').insert(slice);
    if (error) {
      console.error('Erro ao inserir batch:', error);
      process.exit(1);
    }
  }
  console.log('Seed concluído.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
