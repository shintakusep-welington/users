// Recupera transações do localStorage
let transacoes = JSON.parse(localStorage.getItem('transacoes_restaurante')) || [];

// Elementos da DOM
const form = document.getElementById('finance-form');
const inputData = document.getElementById('data');
const inputDataRelatorio = document.getElementById('data-relatorio');
const btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');

const tabelaCorpo = document.getElementById('tabela-corpo');
const totalEntradasEl = document.getElementById('total-entradas');
const totalSaidasEl = document.getElementById('total-saidas');
const saldoTotalEl = document.getElementById('saldo-total');

const subtituloRelatorio = document.getElementById('subtitulo-relatorio');
const resumoDiarioBox = document.getElementById('resumo-diario');
const relatorioEntradasEl = document.getElementById('relatorio-entradas');
const relatorioSaidasEl = document.getElementById('relatorio-saidas');
const relatorioSaldoEl = document.getElementById('relatorio-saldo');

// Define a data padrão dos inputs como a data de hoje (AAAA-MM-DD)
const hoje = new Date().toISOString().split('T')[0];
inputData.value = hoje;
inputDataRelatorio.value = hoje;

// Formatar moeda em BRL
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Formatar data (AAAA-MM-DD para DD/MM/AAAA)
function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Atualiza cards do resumo geral acumulado
function atualizarResumoGeral() {
    const entradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
    const saidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
    const saldo = entradas - saidas;

    totalEntradasEl.textContent = formatarMoeda(entradas);
    totalSaidasEl.textContent = formatarMoeda(saidas);
    saldoTotalEl.textContent = formatarMoeda(saldo);

    localStorage.setItem('transacoes_restaurante', JSON.stringify(transacoes));
}

// Renderizar Tabela (Geral ou Filtrada por Data)
function renderizarTabela(filtroData = null) {
    tabelaCorpo.innerHTML = '';

    let listaExibicao = transacoes;

    // Se houver filtro de data ativo
    if (filtroData) {
        listaExibicao = transacoes.filter(t => t.data === filtroData);
        subtituloRelatorio.textContent = `Relatório do Dia: ${formatarData(filtroData)}`;
        
        // Calcula e exibe resumo do dia
        const eDia = listaExibicao.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
        const sDia = listaExibicao.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
        
        relatorioEntradasEl.textContent = formatarMoeda(eDia);
        relatorioSaidasEl.textContent = formatarMoeda(sDia);
        relatorioSaldoEl.textContent = formatarMoeda(eDia - sDia);
        resumoDiarioBox.style.display = 'flex';
    } else {
        subtituloRelatorio.textContent = 'Exibindo todos os registros cadastrados';
        resumoDiarioBox.style.display = 'none';
    }

    if (listaExibicao.length === 0) {
        tabelaCorpo.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum registro encontrado.</td></tr>';
        return;
    }

    // Ordena os registros da data mais recente para a mais antiga
    listaExibicao.sort((a, b) => new Date(b.data) - new Date(a.data));

    listaExibicao.forEach((transacao) => {
        // Encontra o índice real no array original para poder excluir corretamente
        const indexReal = transacoes.indexOf(transacao);

        const tr = document.createElement('tr');
        const classeTipo = transacao.tipo === 'entrada' ? 'tag-entrada' : 'tag-saida';
        const sinal = transacao.tipo === 'entrada' ? '+' : '-';

        tr.innerHTML = `
            <td>${formatarData(transacao.data)}</td>
            <td>${transacao.descricao}</td>
            <td>${transacao.categoria}</td>
            <td class="${classeTipo}">${transacao.tipo.toUpperCase()}</td>
            <td>${sinal} ${formatarMoeda(transacao.valor)}</td>
            <td class="no-print"><button class="btn-deletar" onclick="removerTransacao(${indexReal})">Excluir</button></td>
        `;

        tabelaCorpo.appendChild(tr);
    });

    atualizarResumoGeral();
}

// Adicionar Nova Transação
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = inputData.value;
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const tipo = document.getElementById('tipo').value;
    const categoria = document.getElementById('categoria').value;

    if (data && descricao && !isNaN(valor)) {
        transacoes.push({ data, descricao, valor, tipo, categoria });
        
        // Limpa campos (mantendo a data)
        document.getElementById('descricao').value = '';
        document.getElementById('valor').value = '';
        
        renderizarTabela();
    }
});

// Evento do Botão de Filtrar Relatório Diário
btnGerarRelatorio.addEventListener('click', () => {
    const dataSelecionada = inputDataRelatorio.value;
    if (dataSelecionada) {
        renderizarTabela(dataSelecionada);
    } else {
        renderizarTabela();
    }
});

// Remover Registro
function removerTransacao(index) {
    transacoes.splice(index, 1);
    const dataFiltro = inputDataRelatorio.value;
    renderizarTabela(dataFiltro ? dataFiltro : null);
}

// Inicializar ao carregar a página
renderizarTabela();