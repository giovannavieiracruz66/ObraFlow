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

function generateReport(type) {
  // In a real app, this would open a filter modal and then generate PDF/CSV.
  // For the demo, we'll just show a success toast and download a fake CSV.
  Toast.success('Gerando relatório...', 'O download iniciará em instantes.');
  setTimeout(() => {
    let data = '';
    if (type === 'fluxo') data = 'Data,Obra,Descricao,Valor\n01/01/2025,Obra 1,Pagamento,15000\n';
    if (type === 'inadimplencia') data = 'Cliente,Obra,Dias Atraso,Valor\nJoão,Obra X,15,5000\n';
    if (!data) data = 'Relatorio,Data\n' + type + ',' + new Date().toISOString() + '\n';
    
    const blob = new Blob(['\uFEFF' + data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${type}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, 1000);
}
