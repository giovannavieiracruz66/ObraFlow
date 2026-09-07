// ==========================================
// OBRAFLOW — CHARTS (Chart.js configurations)
// ==========================================

const ChartInstances = {};

function destroyChart(id) {
  if (ChartInstances[id]) {
    ChartInstances[id].destroy();
    delete ChartInstances[id];
  }
}

const chartDefaults = {
  font: { family: 'Inter', size: 12 },
  color: '#64748b'
};

// Revenue Line Chart (últimos 12 meses)
function renderRevenueChart(canvasId, data = MONTHLY_REVENUE) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  ChartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.month),
      datasets: [
        {
          label: 'Previsto',
          data: data.map(d => d.previsto),
          borderColor: '#cbd5e1',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 3,
          pointBackgroundColor: '#cbd5e1',
          fill: false,
          tension: 0.4
        },
        {
          label: 'Realizado',
          data: data.map(d => d.realizado),
          borderColor: '#0f3460',
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#0f3460',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          fill: {
            target: 'origin',
            above: 'rgba(15,52,96,0.06)'
          },
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { ...chartDefaults, boxWidth: 12, boxHeight: 2, usePointStyle: true, pointStyle: 'line' }
        },
        tooltip: {
          backgroundColor: 'white',
          titleColor: '#0f172a',
          bodyColor: '#64748b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmt.currency(ctx.raw)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { ...chartDefaults, maxRotation: 0 }
        },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            ...chartDefaults,
            callback: v => fmt.currency(v)
          }
        }
      }
    }
  });
}

// Projects by Status Donut
function renderStatusDonut(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  const metrics = Store.getMetrics();
  const labels = ['Em Andamento', 'Concluídas', 'Programadas', 'Orçamento', 'Pausadas'];
  const dataVals = [
    metrics.byStatus.em_andamento,
    metrics.byStatus.concluida,
    metrics.byStatus.programada,
    metrics.byStatus.orcamento,
    metrics.byStatus.pausada
  ];
  const colors = ['#10b981', '#0f3460', '#0ea5e9', '#f59e0b', '#8b5cf6'];

  ChartInstances[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: dataVals, backgroundColor: colors, borderWidth: 2, borderColor: 'white', hoverOffset: 4 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { ...chartDefaults, boxWidth: 10, boxHeight: 10, padding: 16, usePointStyle: true, pointStyle: 'circle' }
        },
        tooltip: {
          backgroundColor: 'white',
          titleColor: '#0f172a',
          bodyColor: '#64748b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} obras` }
        }
      }
    }
  });
}

// Budget Conversion Bar Chart
function renderBudgetChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  const m = Store.getMetrics().budgetMetrics;

  ChartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Enviados', 'Aprovados', 'Recusados', 'Aguardando', 'Expirados'],
      datasets: [{
        data: [m.enviado, m.aprovado, m.recusado, m.aguardando, m.expirado],
        backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#94a3b8'],
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'white',
          titleColor: '#0f172a',
          bodyColor: '#64748b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: chartDefaults },
        y: { grid: { color: '#f1f5f9' }, ticks: { ...chartDefaults, stepSize: 1 } }
      }
    }
  });
}

// Previsto x Recebido Bar Chart (Financeiro)
function renderPrevRealizadoChart(canvasId, data = MONTHLY_REVENUE) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  const last6 = data.slice(-6);

  ChartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: last6.map(d => d.month),
      datasets: [
        {
          label: 'Previsto',
          data: last6.map(d => d.previsto),
          backgroundColor: 'rgba(203,213,225,0.6)',
          borderColor: '#cbd5e1',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false
        },
        {
          label: 'Recebido',
          data: last6.map(d => d.realizado),
          backgroundColor: 'rgba(15,52,96,0.8)',
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top', align: 'end',
          labels: { ...chartDefaults, boxWidth: 12, boxHeight: 12, usePointStyle: true, pointStyle: 'rect' }
        },
        tooltip: {
          backgroundColor: 'white',
          titleColor: '#0f172a',
          bodyColor: '#64748b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt.currency(ctx.raw)}` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: chartDefaults },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: { ...chartDefaults, callback: v => fmt.currency(v) }
        }
      }
    }
  });
}

// Measurement Progress Horizontal Bars
function renderMeasurementChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  const projects = Store.getList('projects').filter(p => p.status === 'em_andamento').slice(0, 6);

  ChartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: projects.map(p => p.name.length > 22 ? p.name.slice(0, 22) + '…' : p.name),
      datasets: [
        {
          label: 'Físico',
          data: projects.map(p => p.physicalProgress),
          backgroundColor: 'rgba(16,185,129,0.7)',
          borderRadius: 4
        },
        {
          label: 'Financeiro',
          data: projects.map(p => {
            const meas = Store.getList('measurements').filter(m => m.projectId === p.id && ['aprovada','faturada','paga'].includes(m.status));
            const billed = meas.reduce((s, m) => s + (m.approvedValue || m.value || 0), 0);
            return p.contractValue > 0 ? Math.round(billed / p.contractValue * 100) : 0;
          }),
          backgroundColor: 'rgba(15,52,96,0.7)',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top', align: 'end',
          labels: { ...chartDefaults, boxWidth: 10, boxHeight: 10, usePointStyle: true, pointStyle: 'rect' }
        },
        tooltip: {
          backgroundColor: 'white',
          titleColor: '#0f172a',
          bodyColor: '#64748b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}%` }
        }
      },
      scales: {
        x: { grid: { color: '#f1f5f9' }, max: 100, ticks: { ...chartDefaults, callback: v => v + '%' } },
        y: { grid: { display: false }, ticks: { ...chartDefaults } }
      }
    }
  });
}

// Mini sparkline (inline chart for KPI cards)
function renderSparkline(canvasId, data, color = '#0f3460') {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  ChartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{ data, borderColor: color, borderWidth: 2, pointRadius: 0, fill: { target: 'origin', above: color.replace(')', ',0.15)').replace('rgb', 'rgba') }, tension: 0.4 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } }
    }
  });
}

// Closed projects per month bar chart
function renderClosedChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;

  // Count by month from data
  const months = ['Ago/24','Set/24','Out/24','Nov/24','Dez/24','Jan/25'];
  const values = [2, 1, 3, 2, 4, 1];

  ChartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Obras fechadas',
        data: values,
        backgroundColor: 'rgba(14,165,233,0.7)',
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'white', titleColor: '#0f172a', bodyColor: '#64748b',
          borderColor: '#e2e8f0', borderWidth: 1, padding: 12
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: chartDefaults },
        y: { grid: { color: '#f1f5f9' }, ticks: { ...chartDefaults, stepSize: 1 } }
      }
    }
  });
}
