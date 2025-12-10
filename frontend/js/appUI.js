/* ===== Data model (localStorage keys) ===== */
const KEY_CAMPAIGNS = 'andros_campaigns_v1';
const KEY_RESPONSES = 'andros_responses_v1';

function readCampaigns(){
  try{
    return JSON.parse(localStorage.getItem(KEY_CAMPAIGNS) || '[]');
  }catch(e){return []}
}
function writeCampaigns(list){
  localStorage.setItem(KEY_CAMPAIGNS, JSON.stringify(list));
}
function readResponses(){
  try{ return JSON.parse(localStorage.getItem(KEY_RESPONSES) || '[]'); }catch(e){return []}
}
function writeResponses(list){
  localStorage.setItem(KEY_RESPONSES, JSON.stringify(list));
}

/* ===== Utilities ===== */
function uid(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2,9); }

/* ===== UI References ===== */
const campaignListEl = document.getElementById('campaignList');
const contentArea = document.getElementById('contentArea');
const mainTitle = document.getElementById('mainTitle');
const btnNewCampaign = document.getElementById('btnNewCampaign');
const btnRunCampaign = document.getElementById('btnRunCampaign');
const btnViewResponses = document.getElementById('btnViewResponses');
const btnExport = document.getElementById('btnExport');
const btnImport = document.getElementById('btnImport');
const importFile = document.getElementById('importFile');
const filterInput = document.getElementById('filterInput');

let campaigns = readCampaigns();
let responses = readResponses();
let selectedCampaignId = null;

/* ===== Render campaign list ===== */
function renderCampaignList(filter=''){
  campaignListEl.innerHTML = '';
  const now = new Date();
  const list = campaigns
    .filter(c=>c.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));

  if(list.length===0){ campaignListEl.innerHTML = '<div class="tiny muted">No hay campañas.</div>'; return; }

  list.forEach(c=>{
    const item = document.createElement('div');
    item.className = 'campaign-item' + (c.id===selectedCampaignId? ' active':'');
    item.tabIndex = 0;
    const meta = document.createElement('div'); meta.className='campaign-meta';
    const name = document.createElement('div'); name.className='campaign-name'; name.textContent = c.name;
    const dates = document.createElement('div'); dates.className='campaign-dates'; dates.textContent = formatRange(c.dateStart, c.dateEnd);
    meta.appendChild(name); meta.appendChild(dates);
    const desc = document.createElement('div'); desc.className='tiny'; desc.textContent = c.questions.length + ' preguntas';

    item.appendChild(meta); item.appendChild(desc);
    item.addEventListener('click', ()=> selectCampaign(c.id));
    item.addEventListener('keypress', (e)=>{ if(e.key==='Enter') selectCampaign(c.id) });
    campaignListEl.appendChild(item);
  });
}

function formatRange(s,e){ if(!s || !e) return 'Sin fechas'; return new Date(s).toLocaleDateString() + ' — ' + new Date(e).toLocaleDateString(); }

/* ===== Select campaign ===== */
function selectCampaign(id){
  selectedCampaignId = id;
  const campaign = campaigns.find(x=>x.id===id);
  mainTitle.textContent = campaign ? campaign.name : 'Seleccioná o creá una campaña';
  btnRunCampaign.disabled = !campaign;
  btnViewResponses.disabled = !campaign;
  renderCampaignList(filterInput.value);
  renderCampaignEditor(campaign);
}

/* ===== Campaign editor / view ===== */
function renderCampaignEditor(campaign){
  if(!campaign){ contentArea.innerHTML = '<p class="small">Seleccioná una campaña para ver o editar sus preguntas, o crea una nueva.</p>'; return; }

  // Si es una campaña con base de clientes, mostrar mensaje
  if(campaign.clientType === 'with_clients'){
    contentArea.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '600px';
    wrapper.style.margin = '40px auto';
    wrapper.style.textAlign = 'center';
    wrapper.innerHTML = `
      <h3>${escapeHtml(campaign.name)}</h3>
      <div style="padding:30px;background:#f0f0f0;border-radius:8px;margin:20px 0">
        <p style="font-size:18px;color:#666">Esta funcionalidad estará disponible próximamente.</p>
        <p class="small" style="margin-top:10px">Campaña configurada para trabajar con base de clientes.</p>
      </div>
      <button id="deleteCampaignSimple" class="btn btn-ghost">Eliminar campaña</button>
    `;
    contentArea.appendChild(wrapper);
    
    document.getElementById('deleteCampaignSimple').addEventListener('click', ()=>{
      if(!confirm('Eliminar campaña?')) return;
      campaigns = campaigns.filter(c=> c.id!==campaign.id);
      writeCampaigns(campaigns);
      selectedCampaignId = null; 
      renderCampaignList(filterInput.value); 
      contentArea.innerHTML = '<p class="small">Campaña eliminada.</p>';
    });
    return;
  }

  contentArea.innerHTML = '';
  const wrapper = document.createElement('div');

  // Campaign info form
  const form = document.createElement('div');
  const startVal = campaign.dateStart ? new Date(campaign.dateStart).toISOString().slice(0,10) : '';
  const endVal = campaign.dateEnd ? new Date(campaign.dateEnd).toISOString().slice(0,10) : '';

  form.innerHTML = `
    <div class="row">
      <div class="col flex-1">
        <label>Nombre</label>
        <input type="text" id="campName" value="${escapeHtml(campaign.name)}" />
      </div>
      <div class="col col-date">
        <label>Fecha inicio</label>
        <input type="date" id="campStart" value="${startVal}" />
      </div>
      <div class="col col-date">
        <label>Fecha fin</label>
        <input type="date" id="campEnd" value="${endVal}" />
      </div>
    </div>
    <div class="row">
      <button id="saveCampaignBtn" class="btn btn-primary">Guardar/Modificar campaña</button>
      <button id="duplicateBtn" class="btn btn-ghost">Duplicar</button>
      <button id="deleteCampaignBtn" class="btn btn-ghost">Eliminar</button>
    </div>
  `;     
  wrapper.appendChild(form);

  // Questions area
  const qArea = document.createElement('div');
  qArea.innerHTML = '<h4>Preguntas</h4>';
  const qList = document.createElement('div'); qList.className='questions-list';

  campaign.questions.forEach(q=>{
    const qc = buildQuestionCard(q, campaign);
    qList.appendChild(qc);
  });

  // Add question button
  const addBtn = document.createElement('div');
  addBtn.style.marginTop='10px';
  addBtn.innerHTML = '<button id="addQuestionBtn" class="btn btn-primary">+ Añadir pregunta</button>';

  qArea.appendChild(qList); qArea.appendChild(addBtn);
  wrapper.appendChild(qArea);

  contentArea.appendChild(wrapper);

  // Events
  document.getElementById('saveCampaignBtn').addEventListener('click', ()=>{
    const name = document.getElementById('campName').value.trim();
    const start = document.getElementById('campStart').value ? new Date(document.getElementById('campStart').value).toISOString() : null;
    const end = document.getElementById('campEnd').value ? new Date(document.getElementById('campEnd').value).toISOString() : null;
    if(!name){ alert('El nombre es obligatorio.'); return; }
    campaign.name = name; campaign.dateStart = start; campaign.dateEnd = end; campaign.updatedAt = new Date().toISOString();
    campaigns = campaigns.map(c=> c.id===campaign.id ? campaign : c);
    writeCampaigns(campaigns);
    renderCampaignList(filterInput.value);
    selectCampaign(campaign.id);
    alert('Campaña guardada.');
  });

  document.getElementById('addQuestionBtn').addEventListener('click', ()=>{
    const newQ = { id: uid('q'), text: 'Nueva pregunta', type: 'single', options: ['Opción 1','Opción 2'] };
    campaign.questions.push(newQ);
    campaigns = campaigns.map(c=> c.id===campaign.id ? campaign : c);
    writeCampaigns(campaigns);
    renderCampaignEditor(campaign);
  });

  document.getElementById('duplicateBtn').addEventListener('click', ()=>{
    const copy = JSON.parse(JSON.stringify(campaign));
    copy.id = uid('camp');
    copy.name = copy.name + ' (copia)';
    copy.createdAt = new Date().toISOString();
    campaigns.unshift(copy);
    writeCampaigns(campaigns);
    renderCampaignList(filterInput.value);
    selectCampaign(copy.id);
  });

  document.getElementById('deleteCampaignBtn').addEventListener('click', ()=>{
    if(!confirm('Eliminar campaña y sus registros asociados?')) return;
    campaigns = campaigns.filter(c=> c.id!==campaign.id);
    responses = responses.filter(r=> r.campaignId !== campaign.id);
    writeCampaigns(campaigns); writeResponses(responses);
    selectedCampaignId = null; 
    renderCampaignList(filterInput.value); 
    contentArea.innerHTML = '<p class="small">Campaña eliminada.</p>';
  });
}

function buildQuestionCard(q, campaign){
  const card = document.createElement('div'); card.className='question-card';
  const inner = document.createElement('div');
  inner.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <input type="text" class="q-text" value="${escapeHtml(q.text)}" style="font-weight:600;border:0;background:transparent" />
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-add-option">+ opt</button>
        <button class="btn btn-ghost btn-delete-q">Eliminar</button>
      </div>
    </div>
    <div class="options"></div>
  `;
  card.appendChild(inner);

  const opts = inner.querySelector('.options');
  function renderOptions(){
    opts.innerHTML = '';
    q.options.forEach((op, idx)=>{
      const row = document.createElement('div'); row.className='option-item';
      row.innerHTML = `
        <input class="opt-text" type="text" value="${escapeHtml(op)}" />
        <button class="btn btn-ghost btn-del-opt">Eliminar</button>
      `;
      row.querySelector('.btn-del-opt').addEventListener('click', ()=>{
        if(!confirm('Eliminar opción?')) return; q.options.splice(idx,1); saveQuestionChanges(); renderOptions();
      });
      row.querySelector('.opt-text').addEventListener('change', (e)=>{ q.options[idx] = e.target.value; saveQuestionChanges(); });
      opts.appendChild(row);
    });
  }
  renderOptions();

  inner.querySelector('.q-text').addEventListener('change', (e)=>{ q.text = e.target.value; saveQuestionChanges(); });
  inner.querySelector('.btn-add-option').addEventListener('click', ()=>{ q.options.push('Nueva opción'); saveQuestionChanges(); renderOptions(); });
  inner.querySelector('.btn-delete-q').addEventListener('click', ()=>{
    if(!confirm('Eliminar pregunta?')) return; campaign.questions = campaign.questions.filter(x=> x.id !== q.id); campaigns = campaigns.map(c=> c.id===campaign.id ? campaign : c); writeCampaigns(campaigns); renderCampaignEditor(campaign);
  });

  function saveQuestionChanges(){
    campaigns = campaigns.map(c=> c.id===campaign.id ? campaign : c);
    writeCampaigns(campaigns);
  }

  return card;
}

/* ===== Create new campaign UI ===== */
btnNewCampaign.addEventListener('click', ()=>{
  renderClientTypeSelection();
});

function renderClientTypeSelection(){
  contentArea.innerHTML = '';
  const el = document.createElement('div');
  el.style.maxWidth = '600px';
  el.style.margin = '40px auto';
  el.style.textAlign = 'center';
  el.innerHTML = `
    <h3>Nueva Campaña</h3>
    <p class="small" style="margin-bottom:30px">Seleccioná el tipo de campaña que querés crear:</p>
    <div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap">
      <button id="btnWithClients" class="btn btn-primary" style="padding:20px 30px;font-size:16px">
        Con base de clientes
      </button>
      <button id="btnWithoutClients" class="btn btn-primary" style="padding:20px 30px;font-size:16px">
        Sin base de clientes
      </button>
    </div>
    <div style="margin-top:20px">
      <button id="btnCancelType" class="btn btn-ghost">Cancelar</button>
    </div>
  `;
  contentArea.appendChild(el);

  document.getElementById('btnWithClients').addEventListener('click', ()=>{
    const newCamp = { 
      id: uid('camp'), 
      name: 'Campaña sin nombre', 
      dateStart: null, 
      dateEnd: null, 
      questions: [], 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
      clientType: 'with_clients'
    };
    campaigns.unshift(newCamp); 
    writeCampaigns(campaigns); 
    renderCampaignList(filterInput.value); 
    selectCampaign(newCamp.id);
    alert('Campaña "Con base de clientes" creada. Esta opción estará disponible próximamente.');
  });

  document.getElementById('btnWithoutClients').addEventListener('click', ()=>{
    const newCamp = { 
      id: uid('camp'), 
      name: 'Campaña sin nombre', 
      dateStart: null, 
      dateEnd: null, 
      questions: [], 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
      clientType: 'without_clients'
    };
    campaigns.unshift(newCamp); 
    writeCampaigns(campaigns); 
    renderCampaignList(filterInput.value); 
    selectCampaign(newCamp.id);
  });

  document.getElementById('btnCancelType').addEventListener('click', ()=>{
    contentArea.innerHTML = '<p class="small">Seleccioná una campaña para ver o editar sus preguntas, o crea una nueva.</p>';
  });
}

/* ===== Run campaign: fill survey ===== */
btnRunCampaign.addEventListener('click', ()=>{
  if(!selectedCampaignId) return; 
  const camp = campaigns.find(c=>c.id===selectedCampaignId);
  if(camp.clientType === 'with_clients'){
    alert('Esta funcionalidad estará disponible próximamente.');
    return;
  }
  renderRunCampaign(camp);
});

function renderRunCampaign(camp){
  contentArea.innerHTML = '';
  const el = document.createElement('div');
  el.innerHTML = `
    <h4>Registrar respuesta — ${escapeHtml(camp.name)}</h4>
    <form id="runForm">
      <div class="row">
        <div style="flex:1">
          <label>Nro de cliente</label><input id="clientNumber" type="text" required />
        </div>
        <div style="width:260px">
          <label>Nombre</label><input id="clientName" type="text" required />
        </div>
      </div>
      <div id="runQuestions"></div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button type="submit" class="btn btn-primary">Guardar respuesta</button>
        <button id="cancelRun" type="button" class="btn btn-ghost">Cancelar</button>
      </div>
    </form>
  `;
  contentArea.appendChild(el);

  const runQuestions = document.getElementById('runQuestions');
  camp.questions.forEach((q, idx)=>{
    const qDiv = document.createElement('div'); 
    qDiv.style.marginTop='10px';
    qDiv.className = 'run-question-block';

    qDiv.innerHTML = `<div style="font-weight:600">${idx+1}. ${escapeHtml(q.text)}</div>`;
    const optWrap = document.createElement('div'); optWrap.className='options';
    q.options.forEach((op, i)=>{
      const id = uid('r');
      const wrap = document.createElement('label'); wrap.className='option-item';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'q_'+q.id; 
      input.value = op; 
      input.id = id;
      const span = document.createElement('span'); span.textContent = op;
      wrap.appendChild(input); 
      wrap.appendChild(span);
      optWrap.appendChild(wrap);
    });
    qDiv.appendChild(optWrap); 
    runQuestions.appendChild(qDiv);
  });

  document.getElementById('cancelRun').addEventListener('click', ()=>{ 
    renderCampaignEditor(camp); 
  });

  /* ======== VALIDACIÓN AGREGADA AQUÍ ======== */
  document.getElementById('runForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const num = document.getElementById('clientNumber').value.trim();
    const name = document.getElementById('clientName').value.trim();
    if(!num || !name){ 
      alert('Completar número y nombre del cliente.'); 
      return; 
    }

    let allValid = true;

    // Quitar marcas previas
    document.querySelectorAll('.run-question-block').forEach(b=>{
      b.style.border = 'none';
      b.style.padding = '0';
    });

    camp.questions.forEach(q=>{
      const groupEls = document.getElementsByName('q_'+q.id);
      let hasAnswer = false;
      for(const e of groupEls){
        if(e.checked){
          hasAnswer = true;
          break;
        }
      }

      if(!hasAnswer){
        allValid = false;
        const block = document.querySelector(`.run-question-block:has(input[name="q_${q.id}"])`);
        if(block){
          block.style.border = '2px solid red';
          block.style.padding = '6px';
        }
      }
    });

    if(!allValid){
      alert('Falta seleccionar alguna respuesta.');
      return;
    }
    /* ======== FIN DE VALIDACIÓN ======== */

    const answer = { 
      id: uid('resp'), 
      campaignId: camp.id, 
      clientNumber: num, 
      clientName: name, 
      createdAt: new Date().toISOString(), 
      answers: [] 
    };

    camp.questions.forEach(q=>{
      const entries = [];
      const els = document.getElementsByName('q_'+q.id);
      if(els.length){ 
        for(const e of els){ 
          if(e.checked){ 
            entries.push(e.value); 
            break; 
          } 
        }
      }
      answer.answers.push({ questionId: q.id, response: entries });
    });

    responses.push(answer); 
    writeResponses(responses);
    alert('Respuesta registrada.');
    renderCampaignEditor(camp);
  });
}

/* ===== View responses ===== */
btnViewResponses.addEventListener('click', ()=>{
  if(!selectedCampaignId) return; 
  const camp = campaigns.find(c=>c.id===selectedCampaignId);
  if(camp.clientType === 'with_clients'){
    alert('Esta funcionalidad estará disponible próximamente.');
    return;
  }
  renderResponsesView(camp);
});

/* ===== View responses como REPORTES ===== */
function renderResponsesView(camp){
  contentArea.innerHTML = '';
  const area = document.createElement('div');
  area.innerHTML = `<h4>Reportes — ${escapeHtml(camp.name)}</h4>`;

  const campResponses = responses.filter(r=> r.campaignId === camp.id);
  const meta = document.createElement('div'); 
  meta.className='small'; 
  meta.textContent = campResponses.length + ' respuestas registradas'; 
  area.appendChild(meta);

  if(campResponses.length === 0){ 
    area.innerHTML += '<p class="small">No hay respuestas aún.</p>'; 
    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-ghost';
    backBtn.textContent = 'Volver';
    backBtn.style.marginTop = '20px';
    backBtn.addEventListener('click', ()=> renderCampaignEditor(camp));
    area.appendChild(backBtn);
    contentArea.appendChild(area); 
    return; 
  }

  // Procesar estadísticas por pregunta
  const totalResponses = campResponses.length;
  
  camp.questions.forEach((q, qIndex) => {
    const qBlock = document.createElement('div');
    qBlock.className = 'report-question-block';
    qBlock.style.marginTop = '24px';
    qBlock.style.padding = '16px';
    qBlock.style.background = '#f8f9fa';
    qBlock.style.borderRadius = '8px';
    
    // Título de pregunta
    const qTitle = document.createElement('div');
    qTitle.style.fontWeight = '600';
    qTitle.style.fontSize = '16px';
    qTitle.style.marginBottom = '12px';
    qTitle.textContent = `${qIndex + 1}. ${q.text}`;
    qBlock.appendChild(qTitle);

    // Contar respuestas por opción
    const optionCounts = {};
    q.options.forEach(opt => optionCounts[opt] = []);

    campResponses.forEach(resp => {
      const answer = resp.answers.find(a => a.questionId === q.id);
      if(answer && answer.response && answer.response.length > 0){
        const selectedOption = answer.response[0];
        if(optionCounts[selectedOption]){
          optionCounts[selectedOption].push({
            clientName: resp.clientName,
            clientNumber: resp.clientNumber,
            date: resp.createdAt
          });
        }
      }
    });

    // Mostrar cada opción con estadísticas
    q.options.forEach(opt => {
      const count = optionCounts[opt].length;
      const percentage = totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(1) : 0;
      
      const optRow = document.createElement('div');
      optRow.className = 'report-option-row';
      optRow.style.display = 'flex';
      optRow.style.justifyContent = 'space-between';
      optRow.style.alignItems = 'center';
      optRow.style.padding = '10px 12px';
      optRow.style.marginBottom = '6px';
      optRow.style.background = 'white';
      optRow.style.borderRadius = '6px';
      optRow.style.cursor = count > 0 ? 'pointer' : 'default';
      optRow.style.transition = 'all 0.2s';
      
      if(count > 0){
        optRow.addEventListener('mouseenter', () => {
          optRow.style.background = '#e3f2fd';
          optRow.style.transform = 'translateX(4px)';
        });
        optRow.addEventListener('mouseleave', () => {
          optRow.style.background = 'white';
          optRow.style.transform = 'translateX(0)';
        });
      }

      const leftSide = document.createElement('div');
      leftSide.style.display = 'flex';
      leftSide.style.alignItems = 'center';
      leftSide.style.gap = '12px';
      leftSide.style.flex = '1';

      const optLabel = document.createElement('span');
      optLabel.textContent = opt;
      optLabel.style.fontWeight = '500';

      const barContainer = document.createElement('div');
      barContainer.style.flex = '1';
      barContainer.style.height = '8px';
      barContainer.style.background = '#e0e0e0';
      barContainer.style.borderRadius = '4px';
      barContainer.style.overflow = 'hidden';
      barContainer.style.maxWidth = '200px';

      const barFill = document.createElement('div');
      barFill.style.width = percentage + '%';
      barFill.style.height = '100%';
      barFill.style.background = count > 0 ? '#2196F3' : '#e0e0e0';
      barFill.style.transition = 'width 0.3s';
      barContainer.appendChild(barFill);

      leftSide.appendChild(optLabel);
      leftSide.appendChild(barContainer);

      const rightSide = document.createElement('div');
      rightSide.style.display = 'flex';
      rightSide.style.gap = '16px';
      rightSide.style.alignItems = 'center';

      const countSpan = document.createElement('span');
      countSpan.style.fontWeight = '600';
      countSpan.style.color = '#666';
      countSpan.style.minWidth = '40px';
      countSpan.style.textAlign = 'right';
      countSpan.textContent = `${count}`;

      const percentSpan = document.createElement('span');
      percentSpan.style.fontWeight = '600';
      percentSpan.style.color = '#2196F3';
      percentSpan.style.minWidth = '60px';
      percentSpan.style.textAlign = 'right';
      percentSpan.textContent = `${percentage}%`;

      rightSide.appendChild(countSpan);
      rightSide.appendChild(percentSpan);

      optRow.appendChild(leftSide);
      optRow.appendChild(rightSide);

      // Detalle expandible (clientes que eligieron esta opción)
      const detailsDiv = document.createElement('div');
      detailsDiv.style.display = 'none';
      detailsDiv.style.marginTop = '8px';
      detailsDiv.style.padding = '12px';
      detailsDiv.style.background = '#f0f7ff';
      detailsDiv.style.borderRadius = '6px';
      detailsDiv.style.borderLeft = '3px solid #2196F3';

      if(count > 0){
        const clientsTitle = document.createElement('div');
        clientsTitle.style.fontWeight = '600';
        clientsTitle.style.marginBottom = '8px';
        clientsTitle.style.fontSize = '13px';
        clientsTitle.textContent = `Clientes que eligieron "${opt}":`;
        detailsDiv.appendChild(clientsTitle);

        optionCounts[opt].forEach(client => {
          const clientRow = document.createElement('div');
          clientRow.style.padding = '6px 8px';
          clientRow.style.background = 'white';
          clientRow.style.borderRadius = '4px';
          clientRow.style.marginBottom = '4px';
          clientRow.style.fontSize = '13px';
          
          const dateStr = new Date(client.date).toLocaleDateString() + ' ' + new Date(client.date).toLocaleTimeString();
          clientRow.innerHTML = `
            <div style="display:flex;justify-content:space-between">
              <span><strong>${escapeHtml(client.clientName)}</strong> (${escapeHtml(client.clientNumber)})</span>
              <span class="tiny" style="color:#666">${dateStr}</span>
            </div>
          `;
          detailsDiv.appendChild(clientRow);
        });

        optRow.addEventListener('click', () => {
          const isVisible = detailsDiv.style.display === 'block';
          detailsDiv.style.display = isVisible ? 'none' : 'block';
          optRow.style.background = isVisible ? 'white' : '#e3f2fd';
        });
      }

      qBlock.appendChild(optRow);
      qBlock.appendChild(detailsDiv);
    });

    area.appendChild(qBlock);
  });

  // Botones de acciones
  const actionsDiv = document.createElement('div');
  actionsDiv.style.marginTop = '24px';
  actionsDiv.style.display = 'flex';
  actionsDiv.style.gap = '12px';
  
  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn btn-primary';
  exportBtn.textContent = 'Exportar respuestas (JSON)';
  exportBtn.addEventListener('click', ()=>{
    const data = responses.filter(r=> r.campaignId===camp.id);
    downloadJSON(data, camp.name.replace(/[^a-z0-9]/gi,'_') + '_responses.json');
  });

  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-ghost';
  backBtn.textContent = 'Volver';
  backBtn.addEventListener('click', ()=> renderCampaignEditor(camp));

  actionsDiv.appendChild(exportBtn);
  actionsDiv.appendChild(backBtn);
  area.appendChild(actionsDiv);

  contentArea.appendChild(area);


  document.getElementById('backBtn').addEventListener('click', ()=>{ 
    renderCampaignEditor(camp); 
  });

  document.getElementById('exportCamp').addEventListener('click', ()=>{
    const data = responses.filter(r=> r.campaignId===camp.id);
    downloadJSON(data, camp.name.replace(/[^a-z0-9]/gi,'_') + '_responses.json');
  });
}

/* ===== Export / Import ===== */
btnExport.addEventListener('click', ()=>{
  const payload = { campaigns, responses, exportedAt: new Date().toISOString() };
  downloadJSON(payload, 'androsnet_export_'+ new Date().toISOString().slice(0,10) +'.json');
});
btnImport.addEventListener('click', ()=> importFile.click());
importFile.addEventListener('change', (e)=>{
  const f = e.target.files[0]; 
  if(!f) return; 
  const reader = new FileReader();
  reader.onload = function(){ 
    try{ 
      const data = JSON.parse(this.result); 
      if(Array.isArray(data.campaigns) && Array.isArray(data.responses)){ 
        campaigns = data.campaigns; 
        responses = data.responses; 
        writeCampaigns(campaigns); 
        writeResponses(responses); 
        renderCampaignList(filterInput.value); 
        alert('Importación completa.'); 
      } else alert('Archivo inválido'); 
    }catch(err){ alert('Error leyendo archivo: '+ err.message); } 
  };
  reader.readAsText(f);
});

function downloadJSON(obj, filename){ 
  const blob = new Blob([JSON.stringify(obj,null,2)], {type:'application/json'}); 
  const url = URL.createObjectURL(blob); 
  const a = document.createElement('a'); 
  a.href = url; 
  a.download = filename; 
  a.click(); 
  URL.revokeObjectURL(url); 
}

function escapeHtml(str){ 
  if(!str && str!==0) return ''; 
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;'); 
}

/* ===== Init ===== */
(function init(){
  if(campaigns.length===0){
    const sample = { 
      id: uid('camp'), 
      name: 'Satisfacción instalación - AndrosNet', 
      dateStart: new Date().toISOString(), 
      dateEnd: null, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(), 
      clientType: 'without_clients', 
      questions: [
        { id: uid('q'), text: '¿Cómo calificarías el proceso de instalación de tu servicio?', type:'single', options:['Muy buena','Buena','Regular','Mala'] }
      ]
    };

    campaigns.push(sample);
    writeCampaigns(campaigns);
  }

  renderCampaignList();
})();
