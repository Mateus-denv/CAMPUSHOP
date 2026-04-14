document.addEventListener('DOMContentLoaded', function() {

    // Função para alternar a visibilidade da senha
    window.togglePassword = function(fieldId) {
        const field = document.getElementById(fieldId);
        const icon = field.nextElementSibling;
        if (field.type === 'password') {
            field.type = 'text';
            icon.textContent = '🙈'; // Ícone de olho fechado
        } else {
            field.type = 'password';
            icon.textContent = '👁️'; // Ícone de olho aberto
        }
    }

    // Lógica para a seleção de perfil de usuário
    const profileOptions = document.querySelectorAll('.profile-option');
    if (profileOptions.length > 0) {
        profileOptions.forEach(option => {
            option.addEventListener('click', () => {
                profileOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                const radio = option.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
            });
        });
    }

    const bodyPage = document.body.getAttribute('data-page');
    if (bodyPage === 'produtos') {
        initPaginaProdutos();
    }
    if (bodyPage === 'conta') {
        initPaginaConta();
    }

    const homeProductsGrid = document.getElementById('homeProductsGrid');
    if (homeProductsGrid) {
        carregarProdutosHome(homeProductsGrid);
    }
});

async function fetchJson(url) {
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        let message = 'Erro ao carregar dados';
        try {
            const payload = await response.json();
            message = payload.message || message;
        } catch (e) {
            if (response.status === 401) {
                message = 'Sessão expirada. Faça login novamente.';
            } else if (response.status === 403) {
                message = 'Você não tem permissão para acessar este recurso.';
            }
        }
        throw new Error(message);
    }

    return response.json();
}

function renderProdutosNoGrid(gridElement, produtos) {
    if (!gridElement) {
        return;
    }

    if (!produtos || produtos.length === 0) {
        gridElement.innerHTML = `
            <article class="product-card">
                <div class="product-img"></div>
                <h3 class="product-title">Nenhum produto encontrado</h3>
                <p class="product-price">Cadastre novos produtos para começar.</p>
            </article>
        `;
        return;
    }

    gridElement.innerHTML = produtos.map(produto => `
        <article class="product-card">
            <div class="product-img"></div>
            <h3 class="product-title">${escapeHtml(produto.nome || 'Sem nome')}</h3>
            <p>${escapeHtml(produto.descricao || 'Sem descrição')}</p>
            <p class="product-price">R$ ${formatarPreco(produto.preco)} · Estoque: ${produto.estoque ?? 0}</p>
        </article>
    `).join('');
}

function formatarPreco(valor) {
    const numero = Number(valor);
    if (Number.isNaN(numero)) {
        return '0,00';
    }
    return numero.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

async function carregarProdutosHome(gridElement) {
    try {
        const produtos = await fetchJson('/api/produtos');
        renderProdutosNoGrid(gridElement, produtos.slice(0, 4));
    } catch (error) {
        gridElement.innerHTML = `
            <article class="product-card">
                <div class="product-img"></div>
                <h3 class="product-title">Não foi possível carregar produtos</h3>
                <p class="product-price">${escapeHtml(error.message)}</p>
            </article>
        `;
    }
}

function initPaginaProdutos() {
    const grid = document.getElementById('produtosGrid');
    const feedback = document.getElementById('produtosFeedback');
    const refreshBtn = document.getElementById('refreshProdutosBtn');
    const searchInput = document.getElementById('produtosSearchInput');
    let produtosCache = [];

    const aplicarFiltro = () => {
        const termo = (searchInput?.value || '').trim().toLowerCase();
        const filtrados = produtosCache.filter(produto => {
            const nome = (produto.nome || '').toLowerCase();
            const descricao = (produto.descricao || '').toLowerCase();
            return nome.includes(termo) || descricao.includes(termo);
        });
        renderProdutosNoGrid(grid, filtrados);
        if (feedback) {
            feedback.textContent = `${filtrados.length} produto(s) exibido(s).`;
        }
    };

    const carregar = async () => {
        if (feedback) {
            feedback.textContent = 'Carregando produtos...';
        }
        try {
            produtosCache = await fetchJson('/api/produtos');
            aplicarFiltro();
        } catch (error) {
            if (feedback) {
                feedback.textContent = error.message;
            }
            renderProdutosNoGrid(grid, []);
        }
    };

    if (refreshBtn) {
        refreshBtn.addEventListener('click', carregar);
    }
    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltro);
    }

    carregar();
}

function initPaginaConta() {
    const feedback = document.getElementById('contaFeedback');
    const refreshBtn = document.getElementById('refreshContaBtn');
    const pedidosGrid = document.getElementById('pedidosGrid');
    const pedidosSection = document.getElementById('pedidosSection');

    const carregarConta = async () => {
        if (feedback) {
            feedback.textContent = 'Carregando dados da conta...';
        }

        try {
            const conta = await fetchJson('/api/usuarios/me');

            setText('contaNome', conta.nomeCompleto);
            setText('contaEmail', conta.email);
            setText('contaTipo', conta.tipoUsuario);
            setText('contaInstituicao', conta.instituicao);
            setText('contaCidade', conta.cidade);

            if (conta.tipoUsuario === 'CLIENTE') {
                await carregarPedidosCliente(pedidosGrid);
                if (pedidosSection) {
                    pedidosSection.style.display = 'flex';
                }
            } else {
                if (pedidosSection) {
                    pedidosSection.style.display = 'none';
                }
                if (pedidosGrid) {
                    pedidosGrid.innerHTML = `
                        <article class="order-card">
                            <h3>Perfil vendedor</h3>
                            <p>Pedidos são exibidos apenas para usuários do tipo cliente.</p>
                        </article>
                    `;
                }
            }

            if (feedback) {
                feedback.textContent = 'Dados atualizados com sucesso.';
            }
        } catch (error) {
            if (feedback) {
                feedback.textContent = error.message;
            }
        }
    };

    if (refreshBtn) {
        refreshBtn.addEventListener('click', carregarConta);
    }

    carregarConta();
}

async function carregarPedidosCliente(pedidosGrid) {
    if (!pedidosGrid) {
        return;
    }
    try {
        const pedidos = await fetchJson('/api/pedidos/meus');
        if (!pedidos || pedidos.length === 0) {
            pedidosGrid.innerHTML = `
                <article class="order-card">
                    <h3>Nenhum pedido encontrado</h3>
                    <p>Você ainda não possui pedidos cadastrados.</p>
                </article>
            `;
            return;
        }

        pedidosGrid.innerHTML = pedidos.map(pedido => `
            <article class="order-card">
                <h3>Pedido #${pedido.id}</h3>
                <p><strong>Status:</strong> ${escapeHtml(pedido.status || '-')}</p>
                <p><strong>Data:</strong> ${formatarData(pedido.data)}</p>
                <p><strong>Total:</strong> R$ ${formatarPreco(pedido.valorTotal)}</p>
            </article>
        `).join('');
    } catch (error) {
        pedidosGrid.innerHTML = `
            <article class="order-card">
                <h3>Não foi possível carregar pedidos</h3>
                <p>${escapeHtml(error.message)}</p>
            </article>
        `;
    }
}

function setText(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value || '-';
    }
}

function formatarData(valor) {
    if (!valor) {
        return '-';
    }
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) {
        return valor;
    }
    return data.toLocaleString('pt-BR');
}
