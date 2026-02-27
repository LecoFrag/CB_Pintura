# 🎨 Galeria de Arte — Simulador de Artista Plástico

Simulador de web imersivo onde você assume o papel de um artista plástico em ascensão. Crie obras de arte durante a fase de pintura, monte sua exposição e negocie com colecionadores para maximizar seus lucros.

---

## 🚀 Como Executar

O jogo usa múltiplos arquivos JavaScript e **precisa de um servidor local** para rodar (não abre diretamente clicando no arquivo, por conta de restrições de segurança do navegador).

### Opção 1 — via Node.js (recomendado)

```bash
npx http-server . -p 3000 -o
```

Abra no navegador: `http://localhost:3000`

### Opção 2 — VS Code

Instale a extensão **Live Server** e clique em **"Go Live"** no canto inferior direito.

---

## 🎮 Fases do Jogo

### Fase 1 — Pintura 🎨

- Escolha entre **1 ou 2 quadros por dia** (2 quadros ativa uma penalidade de -5 na rolagem)
- Selecione uma **inspiração** entre 3 cartas reveladas (pode revelar mais 3 com "Pensar Mais")
- Role um **dado d10** somado à sua Base de Pintura para determinar a qualidade da obra
- **Crítico Positivo** (tirou 10): rola um segundo dado e soma
- **Crítico Negativo** (tirou 1): rola um segundo dado e subtrai
- Um **vídeo ambiente** é exibido em tela cheia durante toda a fase de pintura

### Fase 2 — Galeria 🏛

- A exposição simula **8 horas** em tempo real (~20 segundos)
- Visitantes chegam gradualmente conforme o nível de divulgação escolhido
- Compradores de **Tiers mais altos (A, B)** pagam mais e compram obras melhores
- A cada lance recebido, o jogo pausa para você **aceitar ou recusar**
- Obras vendidas recebem um carimbo **"VENDIDO"** na parede

### Fase 3 — Resultados 📊

- Relatório completo de visitantes, vendas e receita líquida
- Obras não vendidas podem ser liquidadas pela galeria a **25% do valor máximo**

---

## 🏷 Qualidade das Obras

| Seal | Categoria | Resultado da Rolagem | Valor Máx. |
|------|-----------|----------------------|------------|
| 🩶 | Banal | 0–7 | 100 eb |
| 🥉 | Amador | 8–13 | 300 eb |
| 🥈 | Promissor | 14–18 | 800 eb |
| 🔵 | Notável | 19–23 | 1.200 eb |
| 🟣 | Excepcional | 24–29 | 1.600 eb |
| 🔴 | Magistral | 30–33 | 2.000 eb |
| 🏆 | Obra-Prima | 34+ | 3.000 eb |

---

## ⚙️ Configurações Iniciais

| Parâmetro | Descrição |
|-----------|-----------|
| **Lotação Máxima** | Teto de visitantes na galeria |
| **Dias de Exposição** | Quantos dias a galeria ficará aberta |
| **Dias de Pintura** | Quantos dias você tem para criar obras |
| **Base de Pintura** | Valor base somado ao dado na rolagem |
| **Nível de Divulgação** | % da lotação que comparece (30%–100%) |
| **Fee da Galeria** | Percentual que a galeria retém de cada venda |

---

## 📂 Estrutura do Projeto

```
/
├── index.html          # Estrutura HTML principal
├── css/
│   └── styles.css      # Design system, layout e animações
├── js/
│   ├── data.js         # Dados: quadros, tabela de qualidade, frases, tiers
│   ├── gameState.js    # Estado global do jogo
│   ├── dice.js         # Sistema de rolagem d10 com críticos
│   ├── painting.js     # Lógica da fase de pintura
│   ├── gallery.js      # Lógica da fase de galeria e visitantes
│   ├── ui.js           # Renderização e manipulação do DOM
│   └── main.js         # Controlador do fluxo principal
└── images/
    ├── Quadro_1.png ... Quadro_19.png   # Artes dos quadros
    └── Zeus_Pintando_Loop.mp4           # Vídeo de fundo da fase de pintura
```

---

## 🛠️ Tecnologias

- **HTML5** + **CSS3** (Grid, Flexbox, variáveis, animações)
- **JavaScript** vanilla (ES6+), organizado em módulos por responsabilidade
- Design **Glassmorphism** com modo escuro e tipografia Google Fonts

---

*Boa sorte sendo o artista mais renomado da cidade! 🎨*
