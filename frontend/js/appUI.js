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
      `;     wrapper.appendChild(form);

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
        // also remove responses related
        responses = responses.filter(r=> r.campaignId !== campaign.id);
        writeCampaigns(campaigns); writeResponses(responses);
        selectedCampaignId = null; renderCampaignList(filterInput.value); contentArea.innerHTML = '<p class="small">Campaña eliminada.</p>';
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

      // populate options
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

      // events
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
            Sin clientes
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

    /* ===== Run campaign: fill survey for a client ===== */
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
          <div class="row"><div style="flex:1"><label>Nro de cliente</label><input id="clientNumber" type="text" required /></div><div style="width:260px"><label>Nombre</label><input id="clientName" type="text" required /></div></div>
          <div id="runQuestions"></div>
          <div style="display:flex;gap:8px;margin-top:12px"><button type="submit" class="btn btn-primary">Guardar respuesta</button><button id="cancelRun" type="button" class="btn btn-ghost">Cancelar</button></div>
        </form>
      `;
      contentArea.appendChild(el);

      const runQuestions = document.getElementById('runQuestions');
      camp.questions.forEach((q, idx)=>{
        const qDiv = document.createElement('div'); qDiv.style.marginTop='10px';
        qDiv.innerHTML = `<div style="font-weight:600">${idx+1}. ${escapeHtml(q.text)}</div>`;
        const optWrap = document.createElement('div'); optWrap.className='options';
        q.options.forEach((op, i)=>{
          const id = uid('r');
          const wrap = document.createElement('label'); wrap.className='option-item';
          const input = document.createElement('input');
          input.type = 'radio';
          input.name = 'q_'+q.id; input.value = op; input.id = id;
          const span = document.createElement('span'); span.textContent = op;
          wrap.appendChild(input); wrap.appendChild(span);
          optWrap.appendChild(wrap);
        });
        qDiv.appendChild(optWrap); runQuestions.appendChild(qDiv);
      });

      document.getElementById('cancelRun').addEventListener('click', ()=>{ renderCampaignEditor(camp); });

      document.getElementById('runForm').addEventListener('submit', (e)=>{
        e.preventDefault();
        const num = document.getElementById('clientNumber').value.trim();
        const name = document.getElementById('clientName').value.trim();
        if(!num || !name){ alert('Completar número y nombre del cliente.'); return; }
        const answer = { id: uid('resp'), campaignId: camp.id, clientNumber: num, clientName: name, createdAt: new Date().toISOString(), answers: [] };
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
        responses.push(answer); writeResponses(responses);
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

    function renderResponsesView(camp){
      contentArea.innerHTML = '';
      const area = document.createElement('div');
      area.innerHTML = `<h4>Respuestas — ${escapeHtml(camp.name)}</h4>`;

      const campResponses = responses.filter(r=> r.campaignId === camp.id).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
      const meta = document.createElement('div'); meta.className='small'; meta.textContent = campResponses.length + ' respuestas registradas'; area.appendChild(meta);

      if(campResponses.length===0){ area.innerHTML += '<p class="small">No hay respuestas aún.</p>'; contentArea.appendChild(area); return; }

      const table = document.createElement('table'); table.className='responses-table';
      const thead = document.createElement('thead'); thead.innerHTML = '<tr><th>Fecha</th><th>Cliente</th><th>Respuestas</th><th></th></tr>'; table.appendChild(thead);
      const tbody = document.createElement('tbody');

      campResponses.forEach(r=>{
        const tr = document.createElement('tr');
        const tdDate = document.createElement('td'); tdDate.textContent = new Date(r.createdAt).toLocaleString();
        const tdClient = document.createElement('td'); tdClient.innerHTML = `<div style="font-weight:600">${escapeHtml(r.clientName)}</div><div class="tiny">${escapeHtml(r.clientNumber)}</div>`;
        const tdAnswers = document.createElement('td');
        const ansWrap = document.createElement('div');
        r.answers.forEach(a=>{
          const q = camp.questions.find(x=>x.id===a.questionId);
          const line = document.createElement('div'); line.innerHTML = `<div style="font-weight:600;font-size:13px">${escapeHtml(q ? q.text : 'Pregunta eliminada')}</div><div class="small">${a.response.join(', ') || '<i>Sin respuesta</i>'}</div>`;
          ansWrap.appendChild(line);
        });
        tdAnswers.appendChild(ansWrap);
        const tdActions = document.createElement('td'); tdActions.innerHTML = `<button class="btn btn-ghost btn-delete-response">Eliminar</button>`;
        tr.appendChild(tdDate); tr.appendChild(tdClient); tr.appendChild(tdAnswers); tr.appendChild(tdActions);
        tbody.appendChild(tr);

        tdActions.querySelector('.btn-delete-response').addEventListener('click', ()=>{
          if(!confirm('Eliminar esta respuesta?')) return; responses = responses.filter(x=> x.id!==r.id); writeResponses(responses); renderResponsesView(camp);
        });
      });

      table.appendChild(tbody);
      area.appendChild(table);

      // export button
      const exportBtn = document.createElement('div'); exportBtn.style.marginTop='12px';
      exportBtn.innerHTML = '<button id="exportCamp" class="btn btn-primary">Exportar respuestas (JSON)</button> <button id="backBtn" class="btn btn-ghost">Volver</button>';
      area.appendChild(exportBtn);

      contentArea.appendChild(area);

      document.getElementById('backBtn').addEventListener('click', ()=>{ renderCampaignEditor(camp); });
      document.getElementById('exportCamp').addEventListener('click', ()=>{
        const data = responses.filter(r=> r.campaignId===camp.id);
        downloadJSON(data, camp.name.replace(/[^a-z0-9]/gi,'_') + '_responses.json');
      });
    }

    /* ===== Export / Import ALL ===== */
    btnExport.addEventListener('click', ()=>{
      const payload = { campaigns, responses, exportedAt: new Date().toISOString() };
      downloadJSON(payload, 'androsnet_export_'+ new Date().toISOString().slice(0,10) +'.json');
    });
    btnImport.addEventListener('click', ()=> importFile.click());
    importFile.addEventListener('change', (e)=>{
      const f = e.target.files[0]; if(!f) return; const reader = new FileReader();
      reader.onload = function(){ try{ const data = JSON.parse(this.result); if(Array.isArray(data.campaigns) && Array.isArray(data.responses)){ campaigns = data.campaigns; responses = data.responses; writeCampaigns(campaigns); writeResponses(responses); renderCampaignList(filterInput.value); alert('Importación completa.'); } else alert('Archivo inválido'); }catch(err){ alert('Error leyendo archivo: '+ err.message); } };
      reader.readAsText(f);
    });

    function downloadJSON(obj, filename){ const blob = new Blob([JSON.stringify(obj,null,2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }

    /* ===== Helpers ===== */
    function escapeHtml(str){ if(!str && str!==0) return ''; return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

    /* ===== Init sample data if empty ===== */
    (function init(){
      if(campaigns.length===0){
        const sample = { id: uid('camp'), name: 'Satisfacción instalación - AndrosNet', dateStart: new Date().toISOString(), dateEnd: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), clientType: 'without_clients', questions: [
          { id: uid('q'), text: '¿Cómo calificarías el proceso de instalación de tu servicio?', type:'single', options:['Muy rápido y ordenado','Aceptable','Lento o con inconvenientes']},
          { id: uid('q'), text: '¿El técnico te explicó claramente el funcionamiento?', type:'single', options:['Sí, muy claro','Más o menos','No, me quedaron dudas']},
          { id: uid('q'), text: '¿El servicio funciona correctamente desde la instalación?', type:'single', options:['Sí, sin problemas','A veces presenta fallas','No funciona bien']},
          { id: uid('q'), text: '¿Cómo fue tu experiencia con la atención al cliente?', type:'single', options:['Excelente','Buena','Regular','Mala']},
          { id: uid('q'), text: '¿Recomendarías nuestro servicio a familiares o amigos?', type:'single', options:['Sí, sin dudar','Tal vez','No']}
        ] };
        campaigns.push(sample); writeCampaigns(campaigns);
      }
      renderCampaignList();
    })();

    /* ===== Search filter ===== */
    filterInput.addEventListener('input', (e)=> renderCampaignList(e.target.value));