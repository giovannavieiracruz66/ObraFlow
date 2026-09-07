// ==========================================
// CRONOGRAMA PAGE
// ==========================================

let cronoFilter = { responsible: '', projectId: '', view: 'month' };
let currentDate = new Date();

function renderCronograma() {
  const projects = Store.getList('projects');
  const responsibles = [...new Set(projects.map(p => p.responsible))].filter(Boolean).sort();

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Cronograma</h1>
        <p>Visão geral de prazos e eventos das obras</p>
      </div>
      <div class="page-header-actions">
        <div class="view-switcher">
          <button class="view-btn ${cronoFilter.view === 'month' ? 'active' : ''}" onclick="setCronoView('month')">Mês</button>
          <button class="view-btn ${cronoFilter.view === 'list' ? 'active' : ''}" onclick="setCronoView('list')">Lista</button>
        </div>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="filters-bar" style="margin-bottom:20px;">
      <div class="cronograma-nav" style="margin-bottom:0;margin-right:auto;">
        <button class="btn btn-sm btn-outline" onclick="changeMonth(-1)">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="cal-nav-title" id="cal-month-title"></div>
        <button class="btn btn-sm btn-outline" onclick="changeMonth(1)">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="btn btn-sm btn-ghost" onclick="currentDate=new Date();renderCronoContent()">Hoje</button>
      </div>

      <select class="filter-select" onchange="cronoFilter.projectId=this.value;renderCronoContent()">
        <option value="">Todas as obras</option>
        ${projects.map(p => `<option value="${p.id}" ${cronoFilter.projectId===p.id?'selected':''}>${p.name}</option>`).join('')}
      </select>
      <select class="filter-select" onchange="cronoFilter.responsible=this.value;renderCronoContent()">
        <option value="">Todos os responsáveis</option>
        ${responsibles.map(r => `<option value="${r}" ${cronoFilter.responsible===r?'selected':''}>${r}</option>`).join('')}
      </select>
    </div>

    <div class="card">
      <div id="crono-content" style="padding:4px;"></div>
    </div>
  `;

  renderCronoContent();
}

function setCronoView(view) {
  cronoFilter.view = view;
  renderCronograma();
}

function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCronoContent();
}

function renderCronoContent() {
  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  document.getElementById('cal-month-title').textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const container = document.getElementById('crono-content');
  const events = getEvents(currentDate.getFullYear(), currentDate.getMonth());

  if (cronoFilter.view === 'list') {
    container.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>DATA</th><th>TIPO</th><th>OBRA</th><th>DETALHES</th></tr></thead>
          <tbody>
            ${events.length ? events.map(e => `
              <tr>
                <td class="font-semibold">${fmt.date(e.date)}</td>
                <td><span class="badge ${e.type === 'start' ? 'badge-green' : e.type === 'end' ? 'badge-red' : e.type === 'pay' ? 'badge-blue' : 'badge-orange'}">${e.typeLabel}</span></td>
                <td class="td-main">${e.projectName}</td>
                <td>${e.title}</td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhum evento neste mês</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
    return;
  }

  // Month View (Calendar)
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  let calHtml = `
    <div class="calendar-grid">
      <div class="cal-header">Dom</div><div class="cal-header">Seg</div><div class="cal-header">Ter</div>
      <div class="cal-header">Qua</div><div class="cal-header">Qui</div><div class="cal-header">Sex</div><div class="cal-header">Sáb</div>
  `;

  let dayCounter = 1;
  let nextMonthCounter = 1;
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  for (let i = 0; i < 42; i++) {
    if (i < firstDay) {
      // Prev month
      const d = daysInPrevMonth - firstDay + i + 1;
      calHtml += `<div class="cal-day other-month"><div class="cal-day-num">${d}</div></div>`;
    } else if (dayCounter <= daysInMonth) {
      // Current month
      const isToday = isCurrentMonth && dayCounter === today.getDate();
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(dayCounter).padStart(2,'0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);
      
      calHtml += `
        <div class="cal-day ${isToday ? 'today' : ''}">
          <div class="cal-day-num">${dayCounter}</div>
          ${dayEvents.map(e => `
            <div class="cal-event ${e.type}" title="${e.title}\n${e.projectName}" onclick="openProjectDetail('${e.projectId}')">
              ${e.typeLabel}: ${e.projectName}
            </div>
          `).join('')}
        </div>
      `;
      dayCounter++;
    } else {
      // Next month
      calHtml += `<div class="cal-day other-month"><div class="cal-day-num">${nextMonthCounter}</div></div>`;
      nextMonthCounter++;
    }
  }

  calHtml += `</div>`;
  container.innerHTML = calHtml;
}

function getEvents(year, month) {
  const projects = Store.getList('projects');
  const financial = Store.getList('financial');
  const measurements = Store.getList('measurements');
  const events = [];

  const addEvent = (dateStr, type, typeLabel, p, title) => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    // Ignore timezone offset issues by using string prefix
    const prefix = `${year}-${String(month+1).padStart(2,'0')}`;
    if (dateStr.startsWith(prefix)) {
      if (cronoFilter.projectId && p.id !== cronoFilter.projectId) return;
      if (cronoFilter.responsible && p.responsible !== cronoFilter.responsible) return;
      events.push({ date: dateStr, type, typeLabel, title, projectId: p.id, projectName: p.name });
    }
  };

  projects.forEach(p => {
    addEvent(p.startDate, 'start', 'Início', p, `Início da obra: ${p.name}`);
    addEvent(p.endDate, 'end', 'Entrega', p, `Prazo de entrega: ${p.name}`);
  });

  financial.forEach(f => {
    if (f.situation === 'a_receber' || f.situation === 'previsto') {
      const p = projects.find(proj => proj.id === f.projectId);
      if (p) addEvent(f.dueDate, 'pay', 'Recebim.', p, `Previsto: R$ ${fmt.currency(f.value)}`);
    }
  });

  measurements.forEach(m => {
    if (m.status === 'aguardando_aprovacao' || m.status === 'enviada') {
      const p = projects.find(proj => proj.id === m.projectId);
      if (p) addEvent(m.paymentDue, 'medic', 'Medição', p, `Medição #${m.number} vence neste dia.`);
    }
  });

  return events.sort((a,b) => a.date.localeCompare(b.date));
}
