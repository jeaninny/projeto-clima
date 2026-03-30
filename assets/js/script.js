// ── Referências ao DOM ──
const inputCidade   = document.getElementById('input-cidade')
const btnBuscar     = document.getElementById('btn-buscar')
const btnVoltar     = document.getElementById('btn-voltar')
const telaBusca     = document.getElementById('tela-busca')
const telaResultado = document.getElementById('tela-resultado')
const loading       = document.getElementById('loading')
const erro          = document.getElementById('erro')
const erroMensagem  = document.getElementById('erro-mensagem')

// ── Tabela WMO: weathercode → descrição + emoji ──
const WMO = {
  0:  { desc: 'Céu limpo',             icone: 'wi wi-day-sunny'    },
  1:  { desc: 'Principalmente limpo',  icone: 'wi wi-day-cloudy'   },
  2:  { desc: 'Parcialmente nublado',  icone: 'wi wi-day-cloudy'   },
  3:  { desc: 'Nublado',               icone: 'wi wi-cloudy'       },
  45: { desc: 'Neblina',               icone: 'wi wi-fog'          },
  48: { desc: 'Neblina com geada',     icone: 'wi wi-fog'          },
  51: { desc: 'Garoa leve',            icone: 'wi wi-sprinkle'     },
  61: { desc: 'Chuva leve',            icone: 'wi wi-rain'         },
  63: { desc: 'Chuva moderada',        icone: 'wi wi-rain'         },
  65: { desc: 'Chuva forte',           icone: 'wi wi-rain'         },
  80: { desc: 'Pancadas de chuva',     icone: 'wi wi-showers'      },
  81: { desc: 'Pancadas moderadas',    icone: 'wi wi-showers'      },
  95: { desc: 'Tempestade',            icone: 'wi wi-thunderstorm' },
  96: { desc: 'Tempestade c/ granizo leve', icone: 'wi wi-thunderstorm' },
  99: { desc: 'Tempestade c/ granizo', icone: 'wi wi-thunderstorm' },
}

function getCondicao(code) {
  return WMO[code] ?? { desc: 'Condição desconhecida', icone: 'wi wi-na' }
}

// ── Define o tema visual baseado em is_day e weather_code ──
function definirTema(isDay, weatherCode) {
  const periodo = isDay ? 'dia' : 'noite'

  if ([95, 96, 99].includes(weatherCode)) {
    return `${periodo}-tempestade`
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86].includes(weatherCode)) {
    return `${periodo}-chuva`
  }
  
  if ([45, 48].includes(weatherCode)) {
    return `${periodo}-chuva`
  }

  return `${periodo}-ensolarado`
}

// ── Funções auxiliares ──
function mostrarErro(mensagem) {
  erroMensagem.textContent = mensagem
  erro.classList.remove('escondido')
  telaBusca.classList.remove('escondido')
}

function esconderErro() {
  erro.classList.add('escondido')
  erroMensagem.textContent = ''
}

function mostrarLoading() {
  loading.classList.remove('escondido')
  telaBusca.classList.add('escondido')
}

function esconderLoading() {
  loading.classList.add('escondido')
}

// ── Cache: salva dados no localStorage ──
function salvarCache(cidade, dadosClima, dadosPrevisao) {
  const cache = {
    dadosClima,
    dadosPrevisao,
    timestamp: Date.now()
  }
  localStorage.setItem(`cache_${cidade.toLowerCase()}`, JSON.stringify(cache))
}

// ── Cache: recupera dados do localStorage se ainda válidos (10 min) ──
function lerCache(cidade) {
  const item = localStorage.getItem(`cache_${cidade.toLowerCase()}`)
  if (!item) return null

  const cache = JSON.parse(item)
  const dezMinutos = 10 * 60 * 1000

  if (Date.now() - cache.timestamp > dezMinutos) {
    localStorage.removeItem(`cache_${cidade.toLowerCase()}`)
    return null
  }

  return cache
}

// ── Função que busca coordenadas da cidade (Geocoding) ──
async function buscarCoordenadas(cidade) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`
  const resposta = await fetch(url)

  if (!resposta.ok) {
    throw new Error('Falha na API de geocoding.')
  }

  const dados = await resposta.json()

  if (!dados.results || dados.results.length === 0) {
    throw new Error(`Cidade "${cidade}" não encontrada. Verifique o nome e tente novamente.`)
  }

  return dados.results[0]
}

// ── Função que exibe o resultado ──
function exibirResultado(dados, local) {
  const clima  = dados.current
  const unidade = dados.current_units

  // Formata data e hora a partir de current.time ("2026-03-30T16:30")
  const dataHora = new Date(clima.time)
  const data = dataHora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  const hora = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  // Condição do tempo via tabela WMO
  const condicao = getCondicao(clima.weather_code)

  document.getElementById('cidade-nome').textContent = local.name
  document.getElementById('cidade-pais').textContent = `${local.admin1}, ${local.country}`
  document.getElementById('consulta-data').textContent = data
  document.getElementById('consulta-hora').textContent = hora
  document.getElementById('temperatura').textContent = Math.round(clima.temperature_2m) + unidade.temperature_2m
  const iconeEl = document.getElementById('icone-tempo')
  iconeEl.className = condicao.icone
  document.getElementById('descricao-tempo').textContent = condicao.desc
  document.getElementById('umidade').textContent = clima.relative_humidity_2m + unidade.relative_humidity_2m
  document.getElementById('sensacao-termica').textContent = Math.round(clima.apparent_temperature) + unidade.apparent_temperature
  document.getElementById('vento-velocidade').textContent = clima.wind_speed_10m + unidade.wind_speed_10m
  document.getElementById('vento-direcao').textContent = clima.wind_direction_10m + '°'
  document.getElementById('chuva').textContent = clima.rain + unidade.rain
  document.getElementById('precipitacao').textContent = clima.precipitation + unidade.precipitation

  document.body.dataset.periodo = definirTema(clima.is_day, clima.weather_code)

  esconderLoading()
  telaBusca.classList.add('escondido')
  telaResultado.classList.remove('escondido')
}

// ── Função que exibe a previsão dos próximos dias ──
function exibirPrevisao(dados) {
  const lista = document.getElementById('previsao-lista')
  lista.innerHTML = ''

  const { time, temperature_2m_max, temperature_2m_min, weather_code } = dados.daily

  // Pula o índice 0 (hoje) e exibe os próximos 4 dias
  for (let i = 1; i <= 4; i++) {
    console.log(`Dia ${i}: weather_code = ${weather_code[i]}`)
    const data = new Date(time[i] + 'T12:00:00')
    const diaNome = data.toLocaleDateString('pt-BR', { weekday: 'long' })
    const diaData = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    const condicao = getCondicao(weather_code[i])
    const max = Math.round(temperature_2m_max[i])
    const min = Math.round(temperature_2m_min[i])

    const item = document.createElement('li')
    item.className = 'previsao-item'
    item.innerHTML = `
      <div class="previsao-dia">
        <span class="previsao-dia-nome">${diaNome}</span>
        <span class="previsao-dia-data">${diaData}</span>
      </div>
      <i class="previsao-icone ${condicao.icone}" aria-hidden="true"></i>
      <div class="previsao-temps">
        <span class="previsao-max">▲ ${max}°</span>
        <span class="previsao-min">▼ ${min}°</span>
      </div>
    `
    lista.appendChild(item)
  }
}


// ── Função principal: orquestra geocoding + clima ──
async function buscarClima() {
  const cidade = inputCidade.value.trim()

  if (cidade === '') {
    mostrarErro('Digite o nome de uma cidade.')
    return
  }

  esconderErro()
  mostrarLoading()

  // Verifica se existe cache válido para a cidade
    const cache = lerCache(cidade)

    if (cache) {
      const local = await buscarCoordenadas(cidade)
      exibirResultado(cache.dadosClima, local)
      exibirPrevisao(cache.dadosPrevisao)
      return
    }

    // Cache inexistente ou expirado — busca na API

  try {
    const local = await buscarCoordenadas(cidade)

    const urlClima = `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,rain,precipitation,weather_code,is_day,wind_speed_10m,wind_direction_10m&timezone=auto`
    const respostaClima = await fetch(urlClima)
    const dadosClima = await respostaClima.json()

    const urlPrevisao = `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`
    const respostaPrevisao = await fetch(urlPrevisao)
    const dadosPrevisao = await respostaPrevisao.json()

    salvarCache(cidade, dadosClima, dadosPrevisao)
    
    exibirResultado(dadosClima, local)
    exibirPrevisao(dadosPrevisao)

  } catch (error) {
    esconderLoading()
    mostrarErro(error.message)
  }
}

// ── Event Listeners ──
btnBuscar.addEventListener('click', buscarClima)

btnVoltar.addEventListener('click', function() {
  telaResultado.classList.add('escondido')
  telaBusca.classList.remove('escondido')
  esconderErro()
  inputCidade.value = ''
  document.body.dataset.periodo = 'dia-ensolarado'
})

inputCidade.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') buscarClima()
})