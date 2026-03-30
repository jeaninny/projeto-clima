// ── Referências ao DOM ──
const inputCidade   = document.getElementById('input-cidade')
const btnBuscar     = document.getElementById('btn-buscar')
const btnVoltar     = document.getElementById('btn-voltar')
const telaBusca     = document.getElementById('tela-busca')
const telaResultado = document.getElementById('tela-resultado')
const loading       = document.getElementById('loading')
const erro          = document.getElementById('erro')
const erroMensagem  = document.getElementById('erro-mensagem')

// ── Funções auxiliares ──
function mostrarErro(mensagem) {
  erroMensagem.textContent = mensagem
  erro.classList.remove('escondido')
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



// ── Função que busca o clima ──
async function buscarClima() {
  const cidade = inputCidade.value.trim()

  if (cidade === '') {
    mostrarErro('Digite o nome de uma cidade.')
    return
  }

  esconderErro()
  mostrarLoading()

  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=-23.55&longitude=-46.63&current=temperature_2m,apparent_temperature,relative_humidity_2m,rain,precipitation,weather_code,is_day,wind_speed_10m,wind_direction_10m&timezone=auto'
    const resposta = await fetch(url)
    const dados = await resposta.json()

    exibirResultado(dados, cidade)

  } catch (error) {
    esconderLoading()
    mostrarErro('Erro ao buscar dados. Verifique sua conexão.')
  }
}

// ── Tabela WMO: weathercode → descrição + emoji ──
const WMO = {
  0:  { desc: 'Céu limpo',              emoji: '☀️'  },
  1:  { desc: 'Principalmente limpo',   emoji: '🌤️' },
  2:  { desc: 'Parcialmente nublado',   emoji: '⛅'  },
  3:  { desc: 'Nublado',                emoji: '☁️'  },
  45: { desc: 'Neblina',                emoji: '🌫️' },
  48: { desc: 'Neblina com geada',      emoji: '🌫️' },
  51: { desc: 'Garoa leve',             emoji: '🌦️' },
  61: { desc: 'Chuva leve',             emoji: '🌧️' },
  63: { desc: 'Chuva moderada',         emoji: '🌧️' },
  65: { desc: 'Chuva forte',            emoji: '🌧️' },
  80: { desc: 'Pancadas de chuva',      emoji: '🌦️' },
  95: { desc: 'Tempestade',             emoji: '⛈️' },
  99: { desc: 'Tempestade c/ granizo',  emoji: '🌩️' },
}

function getCondicao(code) {
  return WMO[code] ?? { desc: 'Condição desconhecida', emoji: '🌡️' }
}

// ── Função que exibe o resultado ──
function exibirResultado(dados, cidade) {
  const clima  = dados.current
  const unidade = dados.current_units

  // Formata data e hora a partir de current.time ("2026-03-30T16:30")
  const dataHora = new Date(clima.time)
  const data = dataHora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  const hora = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  // Condição do tempo via tabela WMO
  const condicao = getCondicao(clima.weather_code)

  document.getElementById('cidade-nome').textContent = cidade
  document.getElementById('cidade-pais').textContent = ''
  document.getElementById('consulta-data').textContent = data
  document.getElementById('consulta-hora').textContent = hora
  document.getElementById('temperatura').textContent = Math.round(clima.temperature_2m) + unidade.temperature_2m
  document.getElementById('icone-tempo').textContent = condicao.emoji
  document.getElementById('descricao-tempo').textContent = condicao.desc
  document.getElementById('umidade').textContent = clima.relative_humidity_2m + unidade.relative_humidity_2m
  document.getElementById('sensacao-termica').textContent = Math.round(clima.apparent_temperature) + unidade.apparent_temperature
  document.getElementById('vento-velocidade').textContent = clima.wind_speed_10m + unidade.wind_speed_10m
  document.getElementById('vento-direcao').textContent = clima.wind_direction_10m + unidade.wind_direction_10m
  document.getElementById('chuva').textContent = clima.rain + unidade.rain
  document.getElementById('precipitacao').textContent = clima.precipitation + unidade.precipitation

  document.body.dataset.periodo = clima.is_day ? 'dia' : 'noite'

  esconderLoading()
  telaBusca.classList.add('escondido')
  telaResultado.classList.remove('escondido')
}

// ── Event Listeners ──
btnBuscar.addEventListener('click', buscarClima)

btnVoltar.addEventListener('click', function() {
  telaResultado.classList.add('escondido')
  telaBusca.classList.remove('escondido')
  esconderErro()
  inputCidade.value = ''
})

inputCidade.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') buscarClima()
})