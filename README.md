# Lava Rápido - Relatórios e Gráficos

Este projeto foi atualizado com novas funcionalidades de relatórios e gráficos.

## Novidades

### 1. Badges por Horário
- Azul: 06h às 11:59h
- Laranja claro: 12h às 17:59h
- Azul escuro: 18h às 05:59h

### 2. Relatório Mensal
- Botão que abre gráfico com a **média de lavagens por período**.

### 3. Total no Mês
- Exibe **soma geral de lavagens no mês**.
- Botão que abre gráfico com **quantidade de lavagens por tipo no mês**.
- Abaixo do gráfico aparece a **soma total de lavagens**.

### 4. Comparativo Semana a Semana
- Nova tela acessível pelo botão no card **Total no Mês**.
- Mostra gráfico comparativo de lavagens por semana, separados por tipo.
- Abaixo do gráfico aparece a **soma total**.

### 5. Produtividade Diária
- Novo botão ao lado do **Relatório Mensal**.
- Exibe gráfico de **produtividade diária (lavagens por dia do mês)**.
- Valores no topo de cada coluna + soma total embaixo.

### 6. Exportar para PowerPoint
- Corrigido carregamento do `JSZip` + `pptxgenjs` para funcionar.
- Botão de exportação disponível nos gráficos mensais.

## Observações
- Todos os botões novos seguem o mesmo estilo **metal btn-outline** (padrão do botão "Alterar senha").
- Os gráficos usam **Chart.js + ChartDataLabels** para mostrar valores no topo.

---
Atualização v6
