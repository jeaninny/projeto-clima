const { buscarCoordenadas, buscarClima, buscarPrevisao } = require('../api.js')

global.fetch = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Testes Unitários - App de Clima', () => {

  // ── TESTES BÁSICOS ──────────────────────────────

  test('1. Nome de cidade válido retorna dados meteorológicos', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ name: 'São Paulo', country: 'Brasil', admin1: 'São Paulo', latitude: -23.55, longitude: -46.63 }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          current: { temperature_2m: 28, weather_code: 2, is_day: 1 }
        })
      })

    const local = await buscarCoordenadas('São Paulo')
    const clima = await buscarClima(local.latitude, local.longitude)

    expect(local.name).toBe('São Paulo')
    expect(clima.current.temperature_2m).toBe(28)
  })

  test('2. Nome de cidade inexistente lança exceção tratada', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] })
    })

    await expect(buscarCoordenadas('xpto')).rejects.toThrow(
      'Cidade "xpto" não encontrada. Verifique o nome e tente novamente.'
    )
  })

  // Mensagem corrigida para refletir a validação atual do api.js
  test('3. Entrada vazia retorna erro de validação', async () => {
    await expect(buscarCoordenadas('')).rejects.toThrow(
      'O nome da cidade não pode ser vazio.'
    )
  })

  test('4. Falha da API gera resposta adequada (timeout ou erro)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    })

    await expect(buscarCoordenadas('São Paulo')).rejects.toThrow(
      'Falha na API de geocoding.'
    )
  })

  // ── CASOS EXTREMOS ──────────────────────────────

  // O api.js atual trata ok: false de forma genérica.
  // Para diferenciar o 429 seria necessário verificar resposta.status.
  test('5. Excesso de requisições deve ser bloqueado', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({})
    })

    await expect(buscarCoordenadas('São Paulo')).rejects.toThrow(
      'Falha na API de geocoding.'
    )
  })

  test('6. Conexão lenta deve dar timeout', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Timeout de rede'))

    await expect(buscarCoordenadas('São Paulo')).rejects.toThrow('Timeout de rede')
  })

  test('7. API mudou e quebrou o formato do JSON', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    })

    await expect(buscarCoordenadas('São Paulo')).rejects.toThrow(
      'Cidade "São Paulo" não encontrada. Verifique o nome e tente novamente.'
    )
  })

  // ── TESTES BUSCAR PREVISÃO ──────────────────────────────

  test('8. Previsão retorna dados dos próximos dias', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        daily: {
          time: ['2026-03-30', '2026-03-31', '2026-04-01', '2026-04-02', '2026-04-03'],
          temperature_2m_max: [30, 32, 28, 27, 29],
          temperature_2m_min: [22, 23, 20, 19, 21],
          weather_code: [0, 3, 61, 80, 95]
        }
      })
    })

    const previsao = await buscarPrevisao(-23.55, -46.63)

    expect(previsao.daily.time).toHaveLength(5)
    expect(previsao.daily.temperature_2m_max[0]).toBe(30)
    expect(previsao.daily.temperature_2m_min[0]).toBe(22)
  })

  test('9. Falha na API de previsão gera erro adequado', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    })

    await expect(buscarPrevisao(-23.55, -46.63)).rejects.toThrow(
      'Falha ao buscar previsão dos próximos dias.'
    )
  })

  test('10. Previsão com formato inesperado de JSON', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    })

    const previsao = await buscarPrevisao(-23.55, -46.63)
    expect(previsao.daily).toBeUndefined()
  })

})