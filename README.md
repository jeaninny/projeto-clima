# 🌤️ Projeto Clima

Aplicativo de previsão do tempo desenvolvido com HTML, CSS e JavaScript puro,
com apoio de ferramentas de Inteligência Artificial.

## 📋 Descrição

O Projeto Clima permite que o usuário informe o nome de uma cidade e visualize
as condições meteorológicas atuais, incluindo temperatura, umidade, vento,
sensação térmica e precipitação. O tema visual da interface se adapta
automaticamente ao período do dia e às condições climáticas.

## ✨ Funcionalidades

- Busca de cidade por nome com geocodificação automática
- Exibição de temperatura, sensação térmica, umidade, vento, chuva e precipitação
- Ícones de clima via biblioteca Weather Icons
- Tema visual dinâmico (dia/noite, ensolarado/chuva/tempestade)
- Exibição de data e hora da consulta
- Tratamento de erros (cidade inválida, falha de rede, API indisponível)

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript (ES6+)
- [API Open-Meteo](https://open-meteo.com/) — previsão do tempo (gratuita, sem autenticação)
- [Weather Icons](https://erikflowers.github.io/weather-icons/) — ícones meteorológicos
- [Jest](https://jestjs.io/) — testes unitários

## 📁 Estrutura de Pastas
```
projeto_clima/
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── img/
│       └── favicon.jpg
├── tests/
│   └── api.test.js
├── api.js
├── index.html
├── package.json
├── .gitignore
└── README.md
```

## 🚀 Como executar

1. Clone o repositório:
```bash
   git clone https://github.com/jeaninny/projeto_clima
```
2. Abra o arquivo `index.html` diretamente no navegador — não é necessário nenhum servidor.

## 🧪 Testes

Este projeto utiliza o **Jest** para testes unitários das funções de API.

### Instalação das dependências
```bash
npm install
```

### Executar os testes
```bash
npm test
```

### Cobertura dos testes

| # | Cenário |
|---|---------|
| 1 | Cidade válida retorna dados meteorológicos |
| 2 | Cidade inexistente lança exceção tratada |
| 3 | Entrada vazia retorna erro de validação |
| 4 | Falha da API gera resposta adequada |
| 5 | Excesso de requisições é tratado |
| 6 | Conexão lenta gera timeout |
| 7 | Formato inesperado do JSON é tratado |

## 📦 Dependências de desenvolvimento

| Pacote | Versão | Finalidade |
|--------|--------|------------|
| jest   | ^29.x  | Testes unitários |

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

## 👩‍💻 Autora

Jeaninny Teixeira