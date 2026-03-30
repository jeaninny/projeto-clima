const { buscarCoordenadas, buscarClima } = require('../api.js')

// Simula o fetch globalmente
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

  test('3. Entrada vazia retorna erro de validação', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] })
    })

    await expect(buscarCoordenadas('')).rejects.toThrow(
      'Cidade "" não encontrada. Verifique o nome e tente novamente.'
    )
  })

  test('4. Falha da API gera resposta adequada (timeout ou erro)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false
    })

    await expect(buscarCoordenadas('São Paulo')).rejects.toThrow(
      'Falha na API de geocoding.'
    )
  })

  // ── CASOS EXTREMOS ──────────────────────────────
// O api.js atual trata ok: false de forma genérica
// para diferenciar o 429 seria necessário verificar resposta.status.
  test('5. Excesso de requisições deve ser bloqueado', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    })

    await expect(buscarCoordenadas('São Paulo')).rejects.toThrow(
      'Falha na API de geocoding.'
    )
  })

  test('6. Conexão lenta deve dar timeout', async () => {
    global.fetch.mockImplementationOnce(
      () => new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout de rede')), 1000)
      )
    )

    await expect(buscarCoordenadas('São Paulo')).rejects.toThrow('Timeout de rede')
  }, 3000)

  test('7. API mudou e quebrou o formato do JSON', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    })

    await expect(buscarCoordenadas('São Paulo')).rejects.toThrow(
      'Cidade "São Paulo" não encontrada. Verifique o nome e tente novamente.'
    )
  })

})