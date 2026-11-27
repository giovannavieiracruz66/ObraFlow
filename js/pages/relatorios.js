// ==========================================
// RELATÓRIOS PAGE
// ==========================================

function renderRelatorios() {
  const content = document.getElementById('page-content');
  
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Relatórios</h1>
        <p>Geração de relatórios gerenciais e financeiros</p>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;">
      <!-- Financeiro -->
      <div class="card">
        <div class="card-header"><div class="card-title">Financeiro</div></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px;">
          <div class="report-option" onclick="generateReport('fluxo')">
            <div class="report-icon" style="color:#0ea5e9;background:#e0f2fe;">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div class="report-text">
              <div class="report-title">Fluxo de Caixa</div>
              <div class="report-desc">Receitas e despesas do período</div>
            </div>
            <div class="report-arrow">→</div>
          </div>
          <div class="report-option" onclick="generateReport('inadimplencia')">
            <div class="report-icon" style="color:#ef4444;background:#fee2e2;">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div class="report-text">
              <div class="report-title">Inadimplência</div>
              <div class="report-desc">Pagamentos em atraso por obra</div>
            </div>
            <div class="report-arrow">→</div>
          </div>
        </div>
      </div>

      <!-- Obras -->
      <div class="card">
        <div class="card-header"><div class="card-title">Obras e Medições</div></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px;">
          <div class="report-option" onclick="generateReport('status')">
            <div class="report-icon" style="color:#10b981;background:#d1fae5;">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div class="report-text">
              <div class="report-title">Status das Obras</div>
              <div class="report-desc">Visão geral e progresso atual</div>
            </div>
            <div class="report-arrow">→</div>
          </div>
          <div class="report-option" onclick="generateReport('medicoes')">
            <div class="report-icon" style="color:#8b5cf6;background:#ede9fe;">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <div class="report-text">
              <div class="report-title">Mapa de Medições</div>
              <div class="report-desc">Histórico de medições e faturamento</div>
            </div>
            <div class="report-arrow">→</div>
          </div>
        </div>
      </div>

      <!-- Comercial -->
      <div class="card">
        <div class="card-header"><div class="card-title">Comercial</div></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px;">
          <div class="report-option" onclick="generateReport('orcamentos')">
            <div class="report-icon" style="color:#f59e0b;background:#fef3c7;">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
            </div>
            <div class="report-text">
              <div class="report-title">Conversão de Orçamentos</div>
              <div class="report-desc">Taxa de aprovação e valores</div>
            </div>
            <div class="report-arrow">→</div>
          </div>
          <div class="report-option" onclick="generateReport('clientes')">
            <div class="report-icon" style="color:#6366f1;background:#e0e7ff;">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
            <div class="report-text">
              <div class="report-title">Carteira de Clientes</div>
              <div class="report-desc">Concentração de obras por cliente</div>
            </div>
            <div class="report-arrow">→</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// GERAÇÃO DOS RELATÓRIOS (CSV com os dados reais do sistema)
// Separador ";" e decimais com vírgula: abre direto no Excel em português.
// ==========================================

function _csvNum(v) {
  const n = Number(v) || 0;
  return n.toFixed(2).replace('.', ',');
}

function _csvDate(d) {
  return d ? fmt.date(d) : '';
}

function _downloadCSV(name, rows) {
  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function generateReport(type) {
  const projects = Store.getList('projects');
  const clients = Store.getList('clients');
  const financial = Store.getList('financial');
  const measurements = Store.getList('measurements');
  const budgets = Store.getList('budgets');
  const projName = id => projects.find(p => p.id === id)?.name || '';
  const clientName = id => clients.find(c => c.id === id)?.name || '';
  const today = new Date().toISOString().slice(0, 10);
  const label = (group, v) => StatusHelpers[group]?.labels?.[v] || v || '';

  const reports = {
    fluxo: () => {
      const rows = [['Data', 'Vencimento', 'Pagamento', 'Obra', 'Cliente', 'Descrição', 'Tipo', 'Situação', 'Forma', 'Valor (R$)']];
      [...financial]
        .sort((a, b) => String(a.dueDate || a.date || '').localeCompare(String(b.dueDate || b.date || '')))
        .forEach(f => rows.push([_csvDate(f.date), _csvDate(f.dueDate), _csvDate(f.paidAt), projName(f.projectId), clientName(f.clientId), f.description, f.type || '', label('financial', f.situation), f.paymentMethod || '', _csvNum(f.value)]));
      return { name: 'fluxo_de_caixa', rows, count: rows.length - 1 };
    },
    inadimplencia: () => {
      const rows = [['Cliente', 'Obra', 'Descrição', 'Vencimento', 'Dias em atraso', 'Valor (R$)']];
      financial
        .filter(f => f.situation === 'atrasado' || (f.situation !== 'recebido' && f.dueDate && String(f.dueDate).slice(0, 10) < today))
        .map(f => ({ f, dias: f.dueDate ? Math.floor((new Date(today) - new Date(String(f.dueDate).slice(0, 10))) / 86400000) : 0 }))
        .sort((a, b) => b.dias - a.dias)
        .forEach(({ f, dias }) => rows.push([clientName(f.clientId), projName(f.projectId), f.description, _csvDate(f.dueDate), Math.max(0, dias), _csvNum(f.value)]));
      return { name: 'inadimplencia', rows, count: rows.length - 1 };
    },
    status: () => {
      const rows = [['Obra', 'Cliente', 'Responsável', 'Status', 'Início', 'Término previsto', 'Valor contratado (R$)', 'Recebido (R$)', 'A receber (R$)', 'Em atraso (R$)', 'Progresso físico (%)']];
      projects.forEach(p => {
        const fin = Store.getProjectFinancials(p.id);
        rows.push([p.name, clientName(p.clientId), p.responsible || '', label('project', p.status), _csvDate(p.startDate), _csvDate(p.endDate), _csvNum(p.contractValue), _csvNum(fin.received), _csvNum(fin.open), _csvNum(fin.overdue), _csvNum(p.physicalProgress)]);
      });
      return { name: 'status_das_obras', rows, count: rows.length - 1 };
    },
    medicoes: () => {
      const rows = [['Obra', 'Medição', 'Período', 'Data', 'Mão de obra (R$)', 'Material (R$)', 'Bruto (R$)', 'Desc. faturamento direto (R$)', 'Caução/Permuta (R$)', 'INSS (R$)', 'ISS (R$)', 'Líquido (R$)', 'Aprovado (R$)', 'Vencimento', 'Pago em', 'Status']];
      [...measurements]
        .sort((a, b) => projName(a.projectId).localeCompare(projName(b.projectId)) || (a.number || 0) - (b.number || 0))
        .forEach(m => {
          const b = getMeasurementBreakdown(m);
          rows.push([projName(m.projectId), m.number, m.period || '', _csvDate(m.date), _csvNum(b.labor), _csvNum(b.material), _csvNum(b.gross), _csvNum(b.discount), _csvNum(b.caution), _csvNum(b.inss), _csvNum(b.iss), _csvNum(b.net), _csvNum(m.approvedValue), _csvDate(m.paymentDue), _csvDate(m.paidAt), label('measurement', m.status)]);
        });
      return { name: 'mapa_de_medicoes', rows, count: rows.length - 1 };
    },
    orcamentos: () => {
      const decided = budgets.filter(b => ['aprovado', 'recusado'].includes(b.status));
      const approved = budgets.filter(b => b.status === 'aprovado');
      const rate = decided.length ? (approved.length / decided.length * 100) : 0;
      const rows = [
        ['Resumo', '', '', '', '', '', ''],
        ['Orçamentos cadastrados', budgets.length, '', '', '', '', ''],
        ['Aprovados', approved.length, '', '', '', '', ''],
        ['Taxa de aprovação (aprovados ÷ respondidos)', _csvNum(rate) + '%', '', '', '', '', ''],
        ['Valor aprovado (R$)', _csvNum(approved.reduce((s, b) => s + (Number(b.finalValue ?? b.value) || 0), 0)), '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['Número', 'Projeto', 'Cliente', 'Criado em', 'Validade', 'Valor final (R$)', 'Status']
      ];
      [...budgets]
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
        .forEach(b => rows.push([b.number || '', b.projectName || '', clientName(b.clientId), _csvDate(b.createdAt), _csvDate(b.validUntil), _csvNum(b.finalValue ?? b.value), label('budget', b.status)]));
      return { name: 'conversao_de_orcamentos', rows, count: budgets.length };
    },
    clientes: () => {
      const rows = [['Cliente', 'Empresa', 'Obras', 'Obras em andamento', 'Orçamentos', 'Valor contratado (R$)', 'Recebido (R$)', 'Em aberto (R$)']];
      clients
        .map(c => ({ c, st: Store.getClientStats(c.id) }))
        .sort((a, b) => (b.st.totalContracted || 0) - (a.st.totalContracted || 0))
        .forEach(({ c, st }) => rows.push([c.name, c.company || 'Pessoa Física', st.projects.length, st.activeProjects, st.budgets.length, _csvNum(st.totalContracted), _csvNum(st.totalReceived), _csvNum(st.pending)]));
      return { name: 'carteira_de_clientes', rows, count: rows.length - 1 };
    }
  };

  const build = reports[type];
  if (!build) { Toast.error('Relatório não encontrado', type); return; }

  try {
    const { name, rows, count } = build();
    if (!count) {
      Toast.info('Nada para exportar', 'Não há registros para este relatório.');
      return;
    }
    _downloadCSV(name, rows);
    Toast.success('Relatório gerado', `${count} registro${count !== 1 ? 's' : ''} exportado${count !== 1 ? 's' : ''}.`);
  } catch (err) {
    console.error('Erro ao gerar relatório:', err);
    Toast.error('Erro ao gerar relatório', err.message);
  }
}
