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

async function buscarClima(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,rain,precipitation,weather_code,is_day,wind_speed_10m,wind_direction_10m&timezone=auto`
  const resposta = await fetch(url)

  if (!resposta.ok) {
    throw new Error('Falha ao buscar dados meteorológicos.')
  }

  return resposta.json()
}

module.exports = { buscarCoordenadas, buscarClima }