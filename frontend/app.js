const API = 'http://localhost:3000/api';

// Controle de estado para edição
let categoriaEditandoId = null;
let transacaoEditandoId = null;

// ── Utilitários ──────────────────────────────────────────
const fmt = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

function toast(msg, tipo = 'sucesso') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast show ${tipo}`;
    setTimeout(() => el.className = 'toast', 3000);
}

// ── Resumo ───────────────────────────────────────────────
async function carregarResumo() {
    const r = await fetch(`${API}/transacoes/resumo/geral`);
    const d = await r.json();
    document.getElementById('totalReceita').textContent = fmt(d.receita);
    document.getElementById('totalDespesa').textContent = fmt(d.despesa);
    const saldo = document.getElementById('totalSaldo');
    saldo.textContent = fmt(d.saldo);
    saldo.style.color = d.saldo >= 0 ? 'var(--receita)' : 'var(--despesa)';
}

// ── CATEGORIAS ───────────────────────────────────────────
async function carregarCategorias() {
    const busca = document.getElementById('buscaCategoria').value;
    const tipo = document.getElementById('filtroCatTipo').value;

    const params = new URLSearchParams();
    if (busca) params.append('busca', busca);
    if (tipo) params.append('tipo', tipo);

    const r = await fetch(`${API}/categorias?${params}`);
    const cats = await r.json();

    // Atualiza select das transações
    const sel = document.getElementById('transCat');
    const atual = sel.value;
    sel.innerHTML = '<option value="">Categoria...</option>';
    cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.nome} (${c.tipo})`;
        sel.appendChild(opt);
    });
    if (atual) sel.value = atual;

    // Renderiza lista
    const lista = document.getElementById('listaCategorias');
    if (!cats.length) { lista.innerHTML = '<p class="vazio">Nenhuma categoria encontrada.</p>'; return; }

    lista.innerHTML = cats.map(c => `
        <div class="item">
            <span class="badge ${c.tipo}">${c.tipo}</span>
            <div class="item-info"><strong>${c.nome}</strong></div>
            <div class="item-acoes">
                <button class="btn-acao btn-edit" onclick="prepararEditarCategoria(${c.id}, '${c.nome}', '${c.tipo}')" title="Editar">✏️</button>
                <button class="btn-acao btn-delete" onclick="deletarCategoria(${c.id})" title="Deletar">🗑️</button>
            </div>
        </div>
    `).join('');
}

function prepararEditarCategoria(id, nome, tipo) {
    categoriaEditandoId = id;
    document.getElementById('catNome').value = nome;
    document.getElementById('catTipo').value = tipo;
    document.getElementById('btnSubmitCategoria').textContent = '💾 Salvar';
}

async function deletarCategoria(id) {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) return;

    const r = await fetch(`${API}/categorias/${id}`, { method: 'DELETE' });
    const d = await r.json();

    if (!r.ok) { toast(d.erro, 'erro'); return; }
    toast('Categoria removida com sucesso!');
    carregarCategorias();
}

document.getElementById('formCategoria').addEventListener('submit', async e => {
    e.preventDefault();
    const nome = document.getElementById('catNome').value;
    const tipo = document.getElementById('catTipo').value;

    const url = categoriaEditandoId ? `${API}/categorias/${categoriaEditandoId}` : `${API}/categorias`;
    const method = categoriaEditandoId ? 'PUT' : 'POST';

    const r = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, tipo })
    });
    const d = await r.json();

    if (!r.ok) { toast(d.erro, 'erro'); return; }

    toast(categoriaEditandoId ? 'Categoria atualizada!' : 'Categoria criada!');
    categoriaEditandoId = null;
    document.getElementById('btnSubmitCategoria').textContent = '+ Adicionar';
    e.target.reset();
    carregarCategorias();
});

document.getElementById('buscaCategoria').addEventListener('input', carregarCategorias);
document.getElementById('filtroCatTipo').addEventListener('change', carregarCategorias);

// ── TRANSAÇÕES ───────────────────────────────────────────
async function carregarTransacoes() {
    const busca = document.getElementById('buscaTransacao').value;
    const tipo = document.getElementById('filtroTransTipo').value;
    const dataInicio = document.getElementById('filtroDataInicio').value;
    const dataFim = document.getElementById('filtroDataFim').value;

    const params = new URLSearchParams();
    if (busca) params.append('busca', busca);
    if (tipo) params.append('tipo', tipo);
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);

    const r = await fetch(`${API}/transacoes?${params}`);
    const trans = await r.json();

    const lista = document.getElementById('listaTransacoes');
    if (!trans.length) { lista.innerHTML = '<p class="vazio">Nenhuma transação encontrada.</p>'; return; }

    lista.innerHTML = trans.map(t => {
        // Formata data ISO (AAAA-MM-DD) para exibição limpa
        const dataFormatada = t.data.split('T')[0];
        const [ano, mes, dia] = dataFormatada.split('-');

        return `
            <div class="item">
                <span class="badge ${t.categoria_tipo}">${t.categoria_tipo}</span>
                <div class="item-info">
                    <strong>${t.descricao}</strong>
                    <small>${t.categoria_nome} • ${dia}/${mes}/${ano}</small>
                </div>
                <span class="item-valor ${t.categoria_tipo}">${fmt(t.valor)}</span>
                <div class="item-acoes">
                    <button class="btn-acao btn-edit" onclick="prepararEditarTransacao(${t.id}, '${t.descricao}', ${t.valor}, '${dataFormatada}', ${t.categoria_id})" title="Editar">✏️</button>
                    <button class="btn-acao btn-delete" onclick="deletarTransacao(${t.id})" title="Deletar">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function prepararEditarTransacao(id, descricao, valor, data, categoria_id) {
    transacaoEditandoId = id;
    document.getElementById('transDesc').value = descricao;
    document.getElementById('transValor').value = valor;
    document.getElementById('transData').value = data;
    document.getElementById('transCat').value = categoria_id;
    document.getElementById('btnSubmitTransacao').textContent = '💾 Salvar';
}

async function deletarTransacao(id) {
    if (!confirm('Tem certeza que deseja deletar esta transação?')) return;

    const r = await fetch(`${API}/transacoes/${id}`, { method: 'DELETE' });
    const d = await r.json();

    if (!r.ok) { toast(d.erro, 'erro'); return; }
    toast('Transação removida!');
    carregarTransacoes();
    carregarResumo();
}

document.getElementById('formTransacao').addEventListener('submit', async e => {
    e.preventDefault();
    const descricao = document.getElementById('transDesc').value;
    const valor = document.getElementById('transValor').value;
    const data = document.getElementById('transData').value;
    const categoria_id = document.getElementById('transCat').value;

    const url = transacaoEditandoId ? `${API}/transacoes/${transacaoEditandoId}` : `${API}/transacoes`;
    const method = transacaoEditandoId ? 'PUT' : 'POST';

    const r = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao, valor: parseFloat(valor), data, categoria_id: parseInt(categoria_id) })
    });
    const d = await r.json();

    if (!r.ok) { toast(d.erro, 'erro'); return; }

    toast(transacaoEditandoId ? 'Transação atualizada!' : 'Transação criada!');
    transacaoEditandoId = null;
    document.getElementById('btnSubmitTransacao').textContent = '+ Adicionar';
    e.target.reset();
    carregarTransacoes();
    carregarResumo();
});

document.getElementById('buscaTransacao').addEventListener('input', carregarTransacoes);
document.getElementById('filtroTransTipo').addEventListener('change', carregarTransacoes);
document.getElementById('filtroDataInicio').addEventListener('change', carregarTransacoes);
document.getElementById('filtroDataFim').addEventListener('change', carregarTransacoes);

// ── Inicializar ──────────────────────────────────────────
carregarCategorias();
carregarTransacoes();
carregarResumo();