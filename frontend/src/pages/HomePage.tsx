import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { categories, products } from '@/lib/mock-data'
import { ArrowRight, Search, Star, Truck, ShieldCheck } from 'lucide-react'
import { useState, useEffect } from "react";
import { calcularDistancia } from '@/lib/utils';

// componente principal da pagina inicial com mapa e localizacao
export default function HomePage() {
  // estados para armazenar a localizacao do usuario
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  
  // cache para armazenar enderecos ja buscados e evitar requisicoes repetidas
  const [cacheEndereco, setCacheEndereco] = useState<Record<number, string>>({});

  // testar geocoding ao obter localizacao
  useEffect(() => {
    if (lat !== null && lng !== null) {
      obterEndereco(lat, lng).then(endereco => {
        if (endereco) console.log("meu endereco:", endereco);
      });
    }
  }, [lat, lng]);

  // funcao para inicializar o mapa do google
  const initMap = (userLat: number, userLng: number) => {
    // verifica se a api do google maps ja foi carregada
    if (!(window as any).google) {
      console.error("google maps ainda nao carregou");
      return;
    }

    // cria o mapa centralizado na localizacao do usuario
    const map = new (window as any).google.maps.Map(
      document.getElementById("map")!,
      {
        zoom: 14,
        center: { lat: userLat, lng: userLng },
      }
    );

    // adiciona marcador na posicao do usuario
    new (window as any).google.maps.Marker({
      position: { lat: userLat, lng: userLng },
      map,
      label: "Voce",
      icon: {
        url: "image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff3d00' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
        scaledSize: new (window as any).google.maps.Size(24, 24),
      },
    });

    // adiciona marcadores para cada produto que tiver coordenadas
    products.forEach((product) => {
      if (product.latitude !== undefined && product.longitude !== undefined) {
        // calcula distancia entre usuario e produto
        const distancia = calcularDistancia(userLat, userLng, product.latitude, product.longitude);
        
        // cria marcador no mapa para o produto
        new (window as any).google.maps.Marker({
          position: {
            lat: product.latitude,
            lng: product.longitude,
          },
          map,
          title: `${product.nome} • ${distancia.toFixed(1)} km`,
          icon: {
            url: "image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath fill='%234caf50' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
            scaledSize: new (window as any).google.maps.Size(20, 20),
          },
        });
      }
    });
  };

  // funcao para obter a localizacao do usuario via geolocalizacao do navegador
  const pegarLocalizacao = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);

        initMap(latitude, longitude); // inicializa o mapa com a localizacao

        enviarParaBackend(latitude, longitude);
      },
      (error) => {
        console.error("erro ao obter localizacao:", error);
        alert("permita o acesso a localizacao para melhor experiencia!");
      }
    );
  };

  // funcao para enviar a localizacao para o backend
  const enviarParaBackend = async (lat: number, lng: number) => {
    try {
      await fetch("http://localhost:8080/api/localizacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
    } catch (error) {
      console.error("falha ao enviar localizacao:", error);
    }
  };

  // funcao para converter coordenadas em endereco (geocoding)
  const obterEndereco = async (
    lat: number,
    lng: number
  ): Promise<string> => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("API key não configurada");
      return "localização indisponível";
    }

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await res.json();

      if (data.status === "OK" && data.results[0]) {
        return data.results[0].formatted_address || "endereço não especificado";
      }
      return "endereço não encontrado";
    } catch (error) {
      console.error("erro no geocoding:", error);
      return "erro ao buscar endereço";
    }
  };
  
  // funcao chamada ao clicar em um produto para mostrar endereco detalhado
  const handleClickProduto = async (product: typeof products[0]) => {
    if (product.latitude && product.longitude) {
      // verifica se endereco ja esta em cache
      let endereco = cacheEndereco[product.id];
      
      if (!endereco) {
        // se nao estiver em cache, faz requisicao para obter endereco
        endereco = await obterEndereco(product.latitude, product.longitude);
        if (endereco) {
          // salva endereco em cache para evitar futuras requisicoes
          setCacheEndereco(prev => ({ ...prev, [product.id]: endereco! }));
        }
      }
      
      if (endereco) {
        // mostra endereco completo em um alerta
        alert(`Localizacao do produto: ${endereco}`);
      } else {
        alert("endereco não encontrado");
      }
    }
  };

  return (
    <Layout>
      {/* banner principal com geolocalizacao integrada */}
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-700 via-indigo-700 to-orange-500 text-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-8 sm:p-10 lg:p-12">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-50">
              marketplace estudantil
            </span>
            
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              compre, venda e converse com estudantes em um so lugar
            </h1>

            {/* botao para obter localizacao do usuario */}
            <button
              onClick={pegarLocalizacao}
              className="mt-4 flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
            >
              📍 usar minha localizacao
              {lat !== null && lng !== null && (
                <span className="text-xs text-blue-100">(atualizado)</span>
              )}
            </button>

            {/* exibe coordenadas da localizacao detectada */}
            {lat !== null && lng !== null && (
              <p className="mt-2 text-xs text-white/80">
                campus detectado: {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            )}

            {/* container do mapa - aparece apenas quando usuario permite localizacao */}
            {lat !== null && lng !== null && (
              <div
                id="map"
                style={{
                  height: "300px",
                  marginTop: "20px",
                  borderRadius: "12px",
                }}
              ></div>
            )}

            <p className="mt-5 max-w-xl text-base text-blue-50/90 sm:text-lg">
              explore produtos do campus, negocie direto no chat e acompanhe tudo no mesmo fluxo.
            </p>

            {/* barra de busca original */}
            <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-sm">
                <Search className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-500">busque livros, eletronicos, roupas ou servicos</span>
              </div>
              <Link to="/categorias" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.01]">
                explorar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* cards de beneficios */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Star, title: 'avaliacoes reais', text: 'vendedores com historico e confianca.' },
                { icon: Truck, title: 'entrega combinada', text: 'negocie retirada no campus com facilidade.' },
                { icon: ShieldCheck, title: 'ambiente seguro', text: 'converse e negocie com mais tranquilidade.' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <item.icon className="h-5 w-5 text-orange-200" />
                  <p className="mt-3 font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-blue-50/80">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* coluna direita do banner */}
          <div className="relative p-8 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />
            <div className="relative flex h-full flex-col justify-between rounded-[1.75rem] border border-white/20 bg-white/10 p-6 backdrop-blur-xl lg:min-h-[520px]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-50/80">destaque do dia</p>
                <div className="mt-4 rounded-[1.5rem] bg-white p-4 text-slate-900 shadow-2xl shadow-black/10">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    <span>produto mais visitado</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">disponivel</span>
                  </div>
                  <div className="mt-4 rounded-[1.25rem] bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-center text-slate-500">
                    imagem principal do marketplace
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold">livro de logica de programacao</p>
                      <p className="text-sm text-slate-500">caio ramos • ufba • camacari</p>
                    </div>
                    <p className="text-2xl font-black text-blue-700">r$ 150</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm">
                  <p className="text-2xl font-black">12+</p>
                  <p className="text-blue-50/80">categorias</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm">
                  <p className="text-2xl font-black">48h</p>
                  <p className="text-blue-50/80">resposta media</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center text-sm">
                  <p className="text-2xl font-black">100%</p>
                  <p className="text-blue-50/80">campus local</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* secoes restantes */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">explore por categoria</h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">encontre exatamente o que voce precisa</p>
          </div>
          <Link to="/categorias" className="hidden text-sm font-semibold text-blue-700 hover:text-blue-800 sm:inline-flex">
            ver todas
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((category) => (
            <Link key={category.id} to="/categorias" className="group rounded-[1.5rem] border border-slate-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${category.color}`}>
                {category.icon}
              </div>
              <p className="mt-4 font-bold text-slate-900">{category.nome}</p>
              <p className="mt-1 text-xs text-slate-500">{category.quantidade} produtos</p>
            </Link>
          ))}
        </div>
      </section>

      {/* secao de produtos em destaque */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">produtos em destaque</h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">os melhores produtos selecionados para voce</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {products.map((product) => {
            // calcula distancia entre usuario e produto se ambos tiverem localizacao
            const distancia = lat !== null && lng !== null &&
                              product.latitude !== undefined &&
                              product.longitude !== undefined
              ? calcularDistancia(lat, lng, product.latitude, product.longitude)
              : null;

            // usa endereco em cache ou nome do local padrao do produto
            const endereco = cacheEndereco[product.id] || product.local;

            return (
              <Link 
                key={product.id} 
                to={`/produto/${product.id}`} 
                className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                onClick={() => handleClickProduto(product)}
              >
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-400">
                  imagem do produto
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em]">
                    <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700">{product.categoria}</span>
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">{product.condicao}</span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">{product.nome}</h3>
                  {/* exibe informacoes do vendedor, localizacao e distancia */}
                  <p className="mt-2 text-sm text-slate-500">
                    {product.vendedor} • {endereco}
                    {distancia !== null && (
                      <span className="block text-blue-600 font-medium mt-1">• {distancia.toFixed(1)} km</span>
                    )}
                  </p>
                  <p className="mt-3 text-2xl font-black text-blue-700">r$ {product.preco.toFixed(2)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}