/**
 * @fileoverview Módulo responsável pela comunicação com as APIs Open-Meteo.
 * Contém funções para geocodificação de cidades e busca de dados meteorológicos.
 */

/**
 * Busca as coordenadas geográficas de uma cidade usando a API de Geocodificação do Open-Meteo.
 *
 * @async
 * @param {string} cidade - Nome da cidade a ser pesquisada (ex: "São Paulo").
 * @returns {Promise<Object>} Objeto com os dados da cidade, incluindo `name`, `country`, `admin1`, `latitude` e `longitude`.
 * @throws {Error} Se o nome da cidade estiver vazio.
 * @throws {Error} Se a requisição à API falhar.
 * @throws {Error} Se a cidade não for encontrada nos resultados.
 *
 * @example
 * const local = await buscarCoordenadas('Rio de Janeiro')
 * console.log(local.latitude) // -22.9068
 */
async function buscarCoordenadas(cidade) {
    if (!cidade || cidade.trim() === '') {
        throw new Error('O nome da cidade não pode ser vazio.')
    }

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

/**
 * Busca os dados meteorológicos atuais de uma localização geográfica usando a API Open-Meteo.
 *
 * @async
 * @param {number} latitude - Latitude da localização (ex: -23.55).
 * @param {number} longitude - Longitude da localização (ex: -46.63).
 * @returns {Promise<Object>} Objeto JSON com os dados do campo `current`, incluindo
 *   temperatura, umidade, código do tempo, vento e precipitação.
 * @throws {Error} Se a requisição à API falhar.
 *
 * @example
 * const clima = await buscarClima(-23.55, -46.63)
 * console.log(clima.current.temperature_2m) // 24.5
 */

async function buscarClima(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,rain,precipitation,weather_code,is_day,wind_speed_10m,wind_direction_10m&timezone=auto`
  const resposta = await fetch(url)

  if (!resposta.ok) {
    throw new Error('Falha ao buscar dados meteorológicos.')
  }

  return resposta.json()
}

/**
 * Busca a previsão do tempo para os próximos 5 dias de uma localização.
 *
 * @async
 * @param {number} latitude - Latitude da localização (ex: -23.55).
 * @param {number} longitude - Longitude da localização (ex: -46.63).
 * @returns {Promise<Object>} Objeto JSON com o campo `daily`, contendo arrays de
 *   datas, temperaturas máximas, mínimas e códigos do tempo.
 * @throws {Error} Se a requisição à API falhar.
 *
 * @example
 * const previsao = await buscarPrevisao(-23.55, -46.63)
 * console.log(previsao.daily.temperature_2m_max) // [28, 30, 27, 25, 29]
 */
async function buscarPrevisao(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`
  const resposta = await fetch(url)

  if (!resposta.ok) {
    throw new Error('Falha ao buscar previsão dos próximos dias.')
  }

  return resposta.json()
}

module.exports = { buscarCoordenadas, buscarClima, buscarPrevisao }