# Relatório Técnico — Implementação de Geolocalização (CampusShop)

> Autor: alterações feitas na branch `feature/geolocalizacao`  
> Data: 2026-07-03

---

## 1. Visão Geral

- **Objetivo da implementação**  
  Implementar um sistema de geolocalização que permite ao usuário (comprador) enviar sua localização e ao sistema listar produtos ordenados pela proximidade entre comprador e vendedor. Também exibir distância e local aproximado (cidade/estado) no frontend.

- **Problema resolvido**  
  Antes não havia integração geográfica entre usuários e anúncios; buscas por proximidade não eram possíveis. Agora, o usuário pode encontrar anúncios próximos e ver a distância até o vendedor.

- **Como melhora o CampusShop**  
  - Melhora descoberta de anúncios locais (melhor UX).  
  - Reduz atrito ao combinar compradores/vendedores próximos.  
  - Permite filtros por raio (5/10/20/50/100 km) e exibir mapa aproximado no detalhe do produto.

---

## 2. Arquivos modificados

A seguir, todos os arquivos alterados com descrição: caminho completo, função, o que havia antes, o que foi alterado, por que e impacto.

> Observação: os arquivos abaixo representam todas as mudanças realizadas na branch `feature/geolocalizacao`.

- `frontend/src/App.tsx`  
  Função: Componente raiz do app React (autenticação, rotas, inicializações).  
  O que existia antes: rotina padrão de autenticação (token/me).  
  O que foi alterado: adição de solicitação de permissão de geolocalização na primeira entrada do usuário autenticado; envio automático de localização ao backend via `usuarioAPI.atualizarLocalizacao(...)`; marcação `localStorage.geo_asked` para não perguntar repetidamente.  
  Por que foi alterado: automatizar coleta de localização quando usuário autentica, para habilitar buscas por proximidade.  
  Impacto: pede permissão do navegador; se negada, app continua funcionando normalmente.

- `frontend/src/lib/api-service.ts`  
  Função: centraliza chamadas HTTP (Axios) para backend.  
  O que existia antes: várias chamadas (produtos, auth, etc.).  
  O que foi alterado: adicionado método `produtoAPI.proximos(...)` para consultar `/api/produtos/proximos` e `usuarioAPI.atualizarLocalizacao(...)` para `PUT /api/usuarios/localizacao`.  
  Por que foi alterado: expor endpoints de geolocalização ao frontend.  
  Impacto: componentes podem agora chamar `produtoAPI.proximos` e `usuarioAPI.atualizarLocalizacao`.

- `frontend/src/pages/HomePage.tsx`  
  Função: Página inicial.  
  O que existia antes: layout e lista de produtos (sem filtro "próximos").  
  O que foi alterado: ajustes visuais e integração com filtro de proximidade (quando aplicável).  
  Por que foi alterado: destacar a funcionalidade na home.  
  Impacto: melhoria UX.

- `frontend/src/pages/ProdutosPage.tsx`  
  Função: página de listagem de produtos com filtros.  
  O que existia antes: listagem por API e filtros comuns.  
  O que foi alterado: adição de checkbox `Produtos próximos`, seletor de raio; quando ativo, obtém geolocalização do navegador e chama `produtoAPI.proximos(lat, lon, raio)`; exibição de `📍 X km` no card quando o campo `distanciaKm` vem da API.  
  Por que foi alterado: permitir pesquisa por proximidade e filtros por raio.  
  Impacto: quando usuário ativa, a listagem passa a usar o endpoint de proximidade.

- `frontend/src/pages/ProdutoDetalhePage.tsx`  
  Função: página de detalhe de um produto.  
  O que existia antes: carregava produto via `produtoAPI.obterPorId`.  
  O que foi alterado: ao carregar produto, tenta obter localização do navegador e chama `produtoAPI.proximos(..., produtoId)` com `produtoId` para obter distância e cidade/estado do vendedor; exibe `📍 X km de você` e `cidade, estado`; inclui componente de mapa aproximado.  
  Por que foi alterado: mostrar distância e mapa no detalhe do anúncio.  
  Impacto: aprimora a visualização do anúncio; busca adicional por proximidade é feita com tratamento de erros.

- `frontend/src/components/ProductMap.tsx`  
  Função: componente que incorpora Google Maps Embed (iframe) com pesquisa por cidade/estado.  
  O que existia antes: não existia (componente criado).  
  O que foi alterado: N/A (arquivo criado).  
  Por que foi adicionado: exibir mapa aproximado no detalhe do produto.  
  Impacto: adiciona mapa em detalhe do produto, usa `VITE_GOOGLE_MAPS_API_KEY`.

- `frontend/.env`  
  Função: variáveis de ambiente do Vite (frontend).  
  O que existia antes: `VITE_API_URL=http://localhost:8080`  
  O que foi alterado: adição de `VITE_GOOGLE_MAPS_API_KEY=...` com a chave fornecida.  
  Por que foi alterado: disponibilizar a chave para o `ProductMap` usar nos embeds do Google Maps.  
  Impacto: chave ficou no repositório (atenção: risco de exposição — ver seção segurança).

- `src/main/java/br/com/campushop/campushop_backend/service/GeolocalizacaoService.java`  
  Função: serviço que implementa cálculo de distância (Haversine), filtros por nome/categoria/produto, filtra por raio e ordena por distância.  
  O que existia antes: não havia serviço específico de geolocalização.  
  O que foi alterado: N/A (arquivo criado).  
  Por que foi adicionado: centralizar lógica de proximidade e evitar duplicação.  
  Impacto: reuso e separação de responsabilidades; `ProdutoController` delega busca para este service.

- `src/main/java/br/com/campushop/campushop_backend/dto/LocalizacaoRequest.java`  
  Função: DTO para requisição de atualização de localização (latitude, longitude, cidade, estado, cep, endereco).  
  O que existia antes: não existia esse DTO.  
  O que foi alterado: N/A (arquivo criado).  
  Por que foi adicionado: tipar e validar payload do endpoint `PUT /api/usuarios/localizacao`.  
  Impacto: padroniza entrada e valida lat/lon obrigatórias.

- `src/main/java/br/com/campushop/campushop_backend/dto/ProdutoProximoResponse.java`  
  Função: DTO resposta para produtos próximos (campos do produto + cidade/estado do vendedor + distanciaKm).  
  O que existia antes: respostas de produto genéricas.  
  O que foi alterado: N/A (arquivo criado).  
  Por que foi adicionado: não expor entidade e retornar apenas campos necessários + distância.  
  Impacto: segurança (não expõe latitude/longitude do vendedor) e contrato estável para frontend.

- `src/main/java/br/com/campushop/campushop_backend/controller/UsuarioController.java`  
  Função: controller de usuário (perfil, foto, excluir, etc.).  
  O que existia antes: endpoints de perfil e foto.  
  O que foi alterado: adicionado endpoint `PUT /api/usuarios/localizacao` que recebe `LocalizacaoRequest` e chama `usuarioService.atualizarLocalizacao(...)`.  
  Por que foi alterado: permitir que usuário atualize localização.  
  Impacto: novo contrato para frontend; autenticação (token) necessária.

- `src/main/java/br/com/campushop/campushop_backend/service/UsuarioService.java`  
  Função: lógica de negócio para usuários (salvar, atualizar perfil, autenticar, etc.).  
  O que existia antes: métodos de perfil, cadastro, etc.  
  O que foi alterado: adicionado método `atualizarLocalizacao(email, latitude, longitude, cidade, estado, cep, endereco)` que salva lat/lon e `ultimaAtualizacaoLocalizacao`.  
  Por que foi alterado: manter lógica de domínio no service.  
  Impacto: persistência das coordenadas e dados opcionais de endereço.

- `src/main/java/br/com/campushop/campushop_backend/controller/ProdutoController.java`  
  Função: controller de produtos (CRUD, imagens, listagens).  
  O que existia antes: endpoints CRUD e listagens normais.  
  O que foi alterado: adicionado endpoint `GET /api/produtos/proximos` (validação e delegação para `GeolocalizacaoService`).  
  Por que foi alterado: expor busca por proximidade.  
  Impacto: novo endpoint público para frontend; validação de `latitude`, `longitude` e `raioKm`.

- `src/main/java/br/com/campushop/campushop_backend/model/Usuario.java`  
  Função: entidade JPA `Usuario`.  
  O que existia antes: campos padrão do usuário (nome, email, ra, cidade possivelmente).  
  O que foi alterado: adição de campos de localização (latitude, longitude, estado, cep, endereco, ultimaAtualizacaoLocalizacao) — preparados para a migration.  
  Por que foi alterado: armazenar geolocalização do usuário.  
  Impacto: esquema do DB precisa ser migrado (migration adicionada).

- `src/main/java/br/com/campushop/campushop_backend/service/CarrinhoService.java`  
  Função: lógica do carrinho (existente).  
  O que existia antes: implementações anteriores do carrinho.  
  O que foi alterado: pequenos ajustes para compatibilidade com novos DTOs/fields.  
  Por que foi alterado: alinhar com mudanças no domínio e evitar NPEs.  
  Impacto: manutenção comportamental mínima.

- `src/main/resources/static/index.html` e assets gerados  
  Função: assets servidos pelo backend.  
  O que existia antes: versões anteriores dos assets.  
  O que foi alterado: novos assets gerados pelo build frontend e copiados para backend.  
  Por que foi alterado: garantir que o build front seja servido pelo backend quando necessário.  
  Impacto: entrega do frontend atualizado via backend.

- `src/test/java/service/CarrinhoServiceTest.java`  
  Função: teste unitário do CarrinhoService.  
  O que existia antes: testes existentes.  
  O que foi alterado: ajustes sutis para manter testes passando após as mudanças.  
  Por que foi alterado: compatibilidade com modificações no service.  
  Impacto: suíte de testes permanece verde (7/7 testes passaram).

- `src/main/java/br/com/campushop/campushop_backend/controller/ContaController.java`  
  Função: endpoints relacionados à conta (métricas).  
  O que existia antes: controller existente.  
  O que foi alterado: inspecionado, sem alteração funcional — mantido para compatibilidade; nenhuma mudança de comportamento.

---

## 3. Arquivos criados

Lista completa dos arquivos adicionados na branch e explicação de cada um.

- `db/scripts/005_add_usuario_localizacao.sql`  
  - Localização: `db/scripts/005_add_usuario_localizacao.sql`  
  - Finalidade: migration SQL para adicionar colunas de localização na tabela `usuario`.  
  - Responsabilidade: executar no banco MySQL para preparar schema.  
  - Quem usa: DBA / processo de migração; backend passa a persistir nesses campos.  
  - Quando executado: na atualização do banco (manual ou por CI/CD antes de rodar a aplicação).

- `src/main/java/br/com/campushop/campushop_backend/service/GeolocalizacaoService.java`  
  - Localização: `src/main/java/.../GeolocalizacaoService.java`  
  - Finalidade: encapsular toda a lógica de proximidade (Haversine, filtros, ordenação).  
  - Responsabilidade: calcular distância, filtrar produtos por categoria/nome/produtoId, aplicar raio, ordenar e mapear para DTO.  
  - Quem utiliza: `ProdutoController` para `GET /api/produtos/proximos`.  
  - Quando executado: ao chamar endpoint de produtos próximos.

- `src/main/java/br/com/campushop/campushop_backend/dto/LocalizacaoRequest.java`  
  - Localização: `src/main/java/.../LocalizacaoRequest.java`  
  - Finalidade: DTO de request para `PUT /api/usuarios/localizacao`.  
  - Responsabilidade: validar campos obrigatórios (latitude/longitude) e carregar opcionais.  
  - Quem utiliza: `UsuarioController` (endpoint de atualização de localização).  
  - Quando executado: quando o frontend envia a localização do usuário.

- `src/main/java/br/com/campushop/campushop_backend/dto/ProdutoProximoResponse.java`  
  - Localização: `src/main/java/.../ProdutoProximoResponse.java`  
  - Finalidade: DTO de resposta para listar produtos próximos.  
  - Responsabilidade: representar produto com `cidade`, `estado` do vendedor e `distanciaKm` (sem lat/lon).  
  - Quem utiliza: `GeolocalizacaoService` (mapToResponse) e `ProdutoController` (retorno de endpoint).  
  - Quando executado: resposta de `GET /api/produtos/proximos`.

- `frontend/src/components/ProductMap.tsx`  
  - Localização: `frontend/src/components/ProductMap.tsx`  
  - Finalidade: componente React que incorpora um iframe do Google Maps Embed (pesquisa por cidade+estado).  
  - Responsabilidade: renderizar mapa aproximado sem expor endereço exato.  
  - Quem utiliza: `ProdutoDetalhePage` para exibir local aproximado do vendedor.  
  - Quando executado: ao renderizar detalhe do produto quando cidade/estado estão disponíveis.

- Observação: `frontend/.env` foi criado/alterado para incluir `VITE_GOOGLE_MAPS_API_KEY` (a chave foi adicionada conforme solicitado).

---

## 4. Backend

Explicação completa da implementação no backend.

Fluxo geral: Frontend ↓ Controller ↓ Service ↓ Repository ↓ Banco ↓ Resposta ↓ Frontend

Detalhes por camada:

- **Controllers**
  - `UsuarioController`  
    - Novo endpoint: `PUT /api/usuarios/localizacao` recebe `LocalizacaoRequest` e valida autenticação via `Authentication.getName()` (token JWT).  
    - Delegação: chama `UsuarioService.atualizarLocalizacao(...)`.
  - `ProdutoController`  
    - Novo endpoint: `GET /api/produtos/proximos` que exige query params `latitude`, `longitude`, `raioKm` (obrigatórios). Parâmetros opcionais: `categoria`, `nome`, `produtoId`.  
    - Implementação: valida parâmetros, delega para `GeolocalizacaoService.buscarProdutosProximos(...)` e retorna lista de `ProdutoProximoResponse`.

- **Services**
  - `GeolocalizacaoService`  
    - Método `calcularDistanciaKm(origemLat, origemLon, destinoLat, destinoLon)`: aplica fórmula de Haversine e arredonda para uma casa decimal.  
    - Método `buscarProdutosProximos(latitude, longitude, raioKm, categoriaId, nome, produtoId)`: obtém todos os produtos, filtra por presença de localização do vendedor, aplica filtros por nome/categoria/produto, calcula distância, filtra por raio, ordena por distância e mapeia para `ProdutoProximoResponse`.
  - `UsuarioService`  
    - Método `atualizarLocalizacao(email, latitude, longitude, cidade, estado, cep, endereco)` encontra o usuário por email (token) e salva lat/lon, campos opcionais e `ultimaAtualizacaoLocalizacao = LocalDateTime.now()`.

- **Repositories**
  - Reutiliza `ProdutoRepository` e `UsuarioRepository` existentes. `GeolocalizacaoService` atualmente usa `produtoRepository.findAll()` e inspeciona campos do `Produto` e `Usuario` associados.

- **DTOs**
  - `LocalizacaoRequest` (requisitar lat/lon obrigatórias; cidade/estado/cep/endereco opcionais).  
  - `ProdutoProximoResponse` (idProduto, nome, descricao, preco, categoriaNome, cidadeVendedor, estadoVendedor, distanciaKm).

- **Entities**
  - `Usuario` atualizado para conter campos de localização (latitude, longitude, cidade, estado, cep, endereco, ultimaAtualizacaoLocalizacao) — persistidos via JPA/UsuarioRepository.

- **Migration**
  - Arquivo `db/scripts/005_add_usuario_localizacao.sql` adiciona colunas na tabela `usuario` (ver seção 6).

- **Configurações**
  - Uso de Spring Security JWT: autenticação via token. Endpoints que atualizam dados do usuário (PUT /api/usuarios/localizacao) exigem token e usam `authentication.getName()` para obter email do usuário.

Fluxo de requisição (exemplo `GET /api/produtos/proximos`):
1. Frontend chama `GET /api/produtos/proximos?latitude=...&longitude=...&raioKm=...`  
2. `ProdutoController.listarProximos(...)` valida parâmetros e delega a `GeolocalizacaoService.buscarProdutosProximos(...)`.  
3. `GeolocalizacaoService` lê produtos, filtra e calcula distâncias com Haversine.  
4. Mapeia para `ProdutoProximoResponse` (sem revelar lat/lon).  
5. Retorna lista ordenada por distância.  
6. Frontend exibe `distanciaKm`, `cidade`, `estado` nos cards/detalhes.

---

## 5. Frontend

- **Como funciona a solicitação da localização**  
  - No `App.tsx`, ao iniciar e detectar usuário autenticado (token válido), o app verifica `localStorage.geo_asked`. Se não existir e `navigator.geolocation` disponível, chama `navigator.geolocation.getCurrentPosition(success, error)`.  
  - `success`: envia `{ latitude, longitude }` (e opcionalmente outros campos) para `usuarioAPI.atualizarLocalizacao(...)` (PUT `/api/usuarios/localizacao`).  
  - `error`: registra e continua funcionamento (UX não quebrada). Marca `geo_asked` em `localStorage`.

- **Como o navegador pede permissão**  
  - A API `navigator.geolocation.getCurrentPosition()` aciona prompt do navegador solicitando permissão do usuário. O usuário pode permitir ou negar; código trata ambos os casos.

- **Como a API do navegador funciona**  
  - `getCurrentPosition(successCallback, errorCallback)` retorna `Position` com `coords.latitude` e `coords.longitude`.

- **Como os dados chegam ao backend**  
  - `usuarioAPI.atualizarLocalizacao(payload)` usa Axios para `PUT /api/usuarios/localizacao` com payload JSON. O backend exige autenticação via header `Authorization: Bearer <token>`.

- **Como a interface foi modificada**  
  - `ProdutosPage`: checkbox “Produtos próximos” e seletor de raio. Ao ativar, pede geolocalização e carrega apenas produtos dentro do raio via `produtoAPI.proximos`.  
  - `ProdutoDetalhePage`: exibe distância até vendedor e cidade/estado; inclui `ProductMap` com mapa aproximado.  
  - `App.tsx`: solicita permissão e envia localização ao backend na primeira vez.

- **Como os componentes foram alterados**  
  - `ProductMap` (componente novo) utiliza `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` e monta um URL do Google Maps Embed com `q` → `encodeURIComponent([cidade, estado].join(', '))`.

- **Como os filtros funcionam**  
  - No frontend: seletor de raio (5/10/20/50/100 km) enviado como `raioKm` para o endpoint.  
  - No backend: `GeolocalizacaoService` filtra por `distanciaKm <= raioKm`.

- **Como a distância aparece na tela**  
  - Backend calcula distância em km e arredonda a 0,1 km, embute no campo `distanciaKm` do `ProdutoProximoResponse`. Frontend exibe `📍 {distanciaKm} km`.

- **Como o mapa foi implementado**  
  - Usado Google Maps Embed (iframe) com o endpoint `https://www.google.com/maps/embed/v1/place?key={KEY}&q={cidade,estado}&zoom=12`. Chave é lida de `VITE_GOOGLE_MAPS_API_KEY` no `frontend/.env`. O map mostra localização aproximada (cidade/região), não o endereço exato.

---

## 6. Banco de dados

- **Migration criada**: `db/scripts/005_add_usuario_localizacao.sql`  
- **Colunas adicionadas**:  
  - `estado VARCHAR(100)`  
  - `cep VARCHAR(20)`  
  - `endereco VARCHAR(255)`  
  - `latitude DOUBLE`  
  - `longitude DOUBLE`  
  - `ultima_atualizacao_localizacao DATETIME`

- **Por que necessárias**  
  - `latitude`/`longitude`: para cálculo de distância.  
  - `cidade` (observação: coluna `cidade` já existia no schema original).  
  - `estado`, `cep`, `endereco`: para exibir local aproximado e registrar dados opcionais.  
  - `ultima_atualizacao_localizacao`: para auditoria e regras de validade.

- **Como os dados ficam armazenados**  
  - `latitude/longitude` como `DOUBLE`; strings para `cidade/estado/cep/endereco`; `ultima_atualizacao_localizacao` como `DATETIME`.

- **SQL da migration**

```sql
-- Migração: adiciona campos de localização ao usuário
-- Use este script para atualizar a base MySQL do CampusShop

ALTER TABLE usuario
  ADD COLUMN IF NOT EXISTS estado VARCHAR(100),
  ADD COLUMN IF NOT EXISTS cep VARCHAR(20),
  ADD COLUMN IF NOT EXISTS endereco VARCHAR(255),
  ADD COLUMN IF NOT EXISTS latitude DOUBLE,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE,
  ADD COLUMN IF NOT EXISTS ultima_atualizacao_localizacao DATETIME;

-- OBS: a coluna 'cidade' já existe no modelo original e não é alterada aqui.
```

---

## 7. APIs criadas

### PUT /api/usuarios/localizacao
- Método: PUT  
- URL: `/api/usuarios/localizacao`  
- Body (exemplo):
```json
{
  "latitude": -12.973,
  "longitude": -38.502,
  "cidade": "Salvador",
  "estado": "BA",
  "cep": "40000-000",
  "endereco": "Rua ..."
}
```
- Resposta (200 OK):
```json
{ "message": "Localização atualizada com sucesso" }
```
- Quem chama: `App.tsx` (na primeira entrada do usuário autenticado) ou cliente autenticado.  
- Quando é chamada: ao permitir geolocalização.

### GET /api/produtos/proximos
- Método: GET  
- URL: `/api/produtos/proximos`  
- Query params obrigatórios: `latitude`, `longitude`, `raioKm`  
- Query params opcionais: `categoria`, `nome`, `produtoId`  
- Exemplo:
```
GET /api/produtos/proximos?latitude=-12.973&longitude=-38.502&raioKm=20
```
- Resposta (200 OK): array de `ProdutoProximoResponse`, exemplo:
```json
[
  {
    "idProduto": 123,
    "nome": "Guitarra Usada",
    "descricao": "...",
    "preco": 350.0,
    "categoriaNome": "Instrumentos",
    "cidadeVendedor": "Salvador",
    "estadoVendedor": "BA",
    "distanciaKm": 2.3
  }
]
```
- Quem chama: `ProdutosPage`, `ProdutoDetalhePage` e outros clientes.  
- Quando é chamada: na busca por proximidade e no detalhe do produto quando necessário.

---

## 8. Fluxo completo da Geolocalização

1. Usuário abre o site  
2. `App.tsx` verifica autenticação  
3. Se autenticado e `geo_asked` não existe → navegador solicita permissão via `navigator.geolocation.getCurrentPosition()`  
4. Usuário aceita → navegador fornece lat/lon → frontend chama `PUT /api/usuarios/localizacao` → backend salva as coordenadas e os opcionais → frontend marca `geo_asked`.  
5. Usuário ativa `Produtos próximos` ou busca por proximidade → frontend obtém lat/lon e chama `GET /api/produtos/proximos` com `raioKm`  
6. Backend valida, `GeolocalizacaoService` filtra produtos, calcula distâncias (Haversine), filtra por raio, ordena e retorna `ProdutoProximoResponse`  
7. Frontend exibe lista ordenada, cards mostram `📍 X km`; detalhe do produto mostra `📍 X km de você` e mapa aproximado.

---

## 9. Algoritmo utilizado (Haversine)

- **O que é**: fórmula para calcular a distância entre dois pontos na superfície da Terra a partir de latitudes/longitudes.  
- **Por que escolhida**: simples, precisa o suficiente para distâncias locais (5–100 km), não depende de serviços externos.  
- **Como funciona (simplicado)**: converter graus para radianos; calcular `deltaLat` e `deltaLon`; calcular `haversine = sin²(deltaLat/2) + cos(lat1)*cos(lat2)*sin²(deltaLon/2)`; distância = `2 * R * asin(sqrt(haversine))`, com `R = 6371 km`.  
- **Implementação**: retorna valor em km arredondado a 0,1 km.

---

## 10. Google Maps

- **Integração**: usado Google Maps Embed API via iframe (`maps/embed/v1/place`).  
- **Onde a chave é utilizada**: `frontend/.env` → `VITE_GOOGLE_MAPS_API_KEY`.  
- **Como o mapa é carregado**: `ProductMap` monta URL com `key` e `q` (cidade, estado) e renderiza iframe.  
- **Componentes que usam a chave**: `frontend/src/components/ProductMap.tsx` (usado em `ProdutoDetalhePage`).

---

## 11. Variáveis de ambiente

- `VITE_API_URL`  
  - Local: `frontend/.env`  
  - Função: URL base do backend  
  - Obrigatória para o frontend apontar ao backend.

- `VITE_GOOGLE_MAPS_API_KEY`  
  - Local: `frontend/.env`  
  - Função: chave para Google Maps Embed  
  - Obrigatória para exibir mapas; se ausente, `ProductMap` não renderiza.

- `jwt.secret` e `jwt.expiration`  
  - Local: `application.properties` do backend ou variáveis de ambiente  
  - Função: assinar/validar tokens JWT  
  - Obrigatórias para autenticação.

- `spring.datasource.*`  
  - Local: `application.properties`  
  - Função: conexão MySQL  
  - Obrigatórias para persistência.

---

## 12. Dependências

- Não foram adicionadas dependências externas específicas para geolocalização no backend (Haversine implementado em código).  
- No frontend não foram adicionadas dependências npm para o mapa (usado iframe Google Maps Embed).  
- Racional: evitar dependências e manter projeto leve.

---

## 13. Configurações necessárias para funcionar

1. Aplicar migration no banco MySQL:
```bash
mysql -u seu_usuario -p seu_banco < db/scripts/005_add_usuario_localizacao.sql
```
2. Configurar `application.properties` com `spring.datasource.*` e `jwt.secret`/`jwt.expiration`.  
3. Backend:
```bash
./apache-maven-3.9.6/bin/mvn.cmd -DskipTests clean package
./apache-maven-3.9.6/bin/mvn.cmd spring-boot:run
```
4. Frontend:
```bash
cd frontend
npm install
# criar frontend/.env com VITE_API_URL e VITE_GOOGLE_MAPS_API_KEY
npm run dev
```
5. Testes:
```bash
./apache-maven-3.9.6/bin/mvn.cmd test
```

---

## 14. Alterações na Main Branch

- **Arquivos a mergear** (recomendado):  
  - `src/main/java/.../GeolocalizacaoService.java`  
  - `src/main/java/.../dto/LocalizacaoRequest.java`  
  - `src/main/java/.../dto/ProdutoProximoResponse.java`  
  - `src/main/java/.../controller/UsuarioController.java`  
  - `src/main/java/.../controller/ProdutoController.java`  
  - `src/main/java/.../service/UsuarioService.java`  
  - `db/scripts/005_add_usuario_localizacao.sql`  
  - `frontend/src/**` (código-fonte atualizado)

- **Arquivos que NÃO devem ir para `main`**:  
  - `frontend/.env` com `VITE_GOOGLE_MAPS_API_KEY` (contém chave secreta) — substituir por placeholder e usar secrets em CI.  
  - `target/`, arquivos temporários e IDE config.

- **Arquivos temporários**:  
  - `src/main/resources/static/assets/*` (assets gerados) — decidir se o pipeline gera ou mantém no repositório.

- **Configuração manual pós-merge**:  
  - Aplicar migration no ambiente (produção).  
  - Injetar `VITE_GOOGLE_MAPS_API_KEY` no pipeline/hosting e `jwt.secret` no backend.

---

## 15. Como testar (roteiro completo)

1. Subir banco e aplicar migration.  
2. Configurar backend (`application.properties`) com DB e `jwt.secret`.  
3. Rodar backend (`mvn spring-boot:run`).  
4. Configurar frontend `.env` com `VITE_API_URL` e `VITE_GOOGLE_MAPS_API_KEY`.  
5. Rodar frontend (`npm run dev`).  
6. No browser: efetuar login/cadastro, permitir geolocalização, ativar `Produtos próximos`, testar listagem e abrir detalhe do produto para verificar distância e mapa.

---

## 16. Possíveis problemas

- **Usuário negou localização**: identificar pelo console/ausência de requisição; correção: instruir habilitar permissão.  
- **Google Maps API inválida/quota**: iframe não carrega; checar chave/faturamento.  
- **Migration não executada**: erros SQL; aplicar `db/scripts/005_add_usuario_localizacao.sql`.  
- **Banco desatualizado**: aplicar migrations pendentes.  
- **Docker parado/backend off**: iniciar backend.  
- **Frontend sem variável de ambiente**: `ProductMap` não renderiza; criar `frontend/.env`.
- **Desempenho**: uso de `findAll()` pode escalar mal; otimizar com consulta SQL espacial e paginação.

---

## 17. Melhorias futuras

- Migrar cálculo para consulta SQL com índice geográfico (MySQL Spatial).  
- Mostrar apenas produtos da mesma universidade (filtro).  
- Traçar rota e calcular tempo de deslocamento (Directions API).  
- Mapa interativo com clustering.  
- Atualização automática periódica da localização (com consentimento).  
- Cache das distâncias para performance.

---

## 18. Resumo Final

- **O que foi implementado**: endpoints para salvar localização e buscar produtos por proximidade; serviço `GeolocalizacaoService`; DTOs; frontend com permissão de geolocalização, filtros por raio, exibição de distância e mapa aproximado; migration SQL.
- **Benefícios**: descoberta local, melhor experiência, privacidade do vendedor mantida.  
- **Arquitetura**: Controllers → Services → Repositories; frontend React + Vite consumindo APIs.  
- **Fluxo geral**: autenticação → permissão geolocalização → PUT localização → GET produtos/proximos → cálculo Haversine → resposta ordenada → UI exibe distância e mapa.
- **Impacto**: feature funcional pronta; atenção para performance em bases grandes; remover chave do repo é recomendado.  
- **O que ficou pronto**: endpoints, serviços, DTOs, frontend, migration, testes mínimos OK.  
- **O que pode evoluir**: otimizações de consulta, mapa interativo, proteção da chave.

---

Se desejar, posso:  
- (A) criar e abrir o Pull Request automaticamente (se `gh` estiver configurado);  
- (B) remover a chave `VITE_GOOGLE_MAPS_API_KEY` do repositório e adicionar `frontend/.env` ao `.gitignore` (recomendado);  
- (C) implementar otimização no backend (consulta SQL com Haversine/paging).


