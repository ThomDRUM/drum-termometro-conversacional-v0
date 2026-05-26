# CAREER_PATHWAYS_RULES.md

## 1. Regra principal

O sistema de trajetórias profissionais deve considerar **apenas** as categorias oficiais presentes no documento PDF de tipos de carreira enviado no projeto.

As únicas trajetórias válidas são:

1. Empreendedor
2. Executivo
3. Profissional liberal
4. Consultor
5. Acadêmico
6. Creator / Autor
7. Sucessor

Nenhuma outra trajetória deve ser criada, inferida, exibida ou usada como categoria válida no sistema.

---

## 2. Categorias descartadas completamente

As categorias abaixo **NÃO existem** no projeto:

- Operador
- Alocador
- Especialista
- Híbrido / Híbridos

Elas devem ser descartadas por completo.

Não devem aparecer como:

- trajetória principal
- trajetória secundária
- modificador
- subtipo
- tag
- fallback
- categoria interna
- categoria visível
- categoria auxiliar
- campo no JSON
- opção de desempate
- output textual
- lógica de análise
- explicação para o usuário

Mesmo que apareçam em conversas anteriores, rascunhos, ambiguidades, exemplos, anotações ou comentários, elas não fazem mais parte da arquitetura do produto.

---

## 3. Fonte oficial

A fonte oficial para tipos de carreira é exclusivamente o PDF:

`Tipos de Carreira - Drum.pdf`

O sistema deve seguir apenas as categorias e definições desse documento.

Se algum arquivo anterior mencionar Operador, Alocador, Especialista ou Híbrido, ignore essas menções.

---

## 4. O que fazer se a fala da pessoa parecer "híbrida"

O sistema **NÃO** deve criar a categoria "Híbrido".

Se a pessoa demonstrar sinais de mais de uma trajetória, o sistema deve:

1. identificar a trajetória dominante;
2. usar a transcrição completa para decidir qual lógica de carreira aparece com mais força;
3. se necessário, registrar internamente uma ambiguidade;
4. mas nunca exibir "Híbrido" como resultado.

### Exemplo 1

A pessoa fala:

> "Eu quero continuar trabalhando na empresa da minha família, mas também criar uma nova frente de negócio digital."

Possíveis sinais:
- Sucessor
- Empreendedor

Decisão esperada:
- Se o foco principal for continuidade, legado, transição familiar e papel no negócio da família → **Sucessor**
- Se o foco principal for criar um negócio novo com autonomia, risco e mercado próprio → **Empreendedor**

Nunca retornar:
- Híbrido
- Sucessor + Empreendedor
- Sucessor empreendedor
- Trajetória híbrida

---

### Exemplo 2

A pessoa fala:

> "Eu quero escrever sobre gestão, construir audiência e talvez vender projetos de consultoria depois."

Possíveis sinais:
- Creator / Autor
- Consultor

Decisão esperada:
- Se o conteúdo, a voz pública e a audiência forem o centro → **Creator / Autor**
- Se o conteúdo for apenas meio para vender projetos e resolver problemas de clientes → **Consultor**

Nunca retornar:
- Híbrido
- Creator-consultor
- Autor consultivo

---

### Exemplo 3

A pessoa fala:

> "Eu quero liderar a empresa da família e profissionalizar a gestão."

Possíveis sinais:
- Executivo
- Sucessor

Decisão esperada:
- Se o foco for liderança organizacional, gestão, time, área e resultado → **Executivo**
- Se o foco for continuidade familiar, transição geracional, legado e papel na empresa da família → **Sucessor**

Nunca retornar:
- Híbrido
- Executivo sucessor
- Liderança familiar híbrida

---

## 5. O que fazer se a fala parecer "especialista"

O sistema **NÃO** deve criar a categoria "Especialista".

Se a pessoa falar de profundidade técnica, domínio específico ou vontade de ser muito boa em algo, o sistema deve decidir entre as 7 categorias oficiais.

### Exemplos

#### Caso 1

A pessoa fala:

> "Quero ser uma referência técnica em dados dentro de uma empresa."

Decisão provável:
- **Executivo**, se o foco for crescimento em organização, liderança ou influência interna.
- **Acadêmico**, se o foco for pesquisa formal e produção de conhecimento.
- **Consultor**, se o foco for vender conhecimento técnico para resolver problemas de clientes.

Nunca retornar:
- Especialista

---

#### Caso 2

A pessoa fala:

> "Quero ser reconhecida como uma ótima médica e construir minha própria carteira de pacientes."

Decisão esperada:
- **Profissional liberal**

Nunca retornar:
- Especialista

---

#### Caso 3

A pessoa fala:

> "Quero dominar um tema e escrever sobre isso publicamente."

Decisão provável:
- **Creator / Autor**, se o centro for obra, audiência, publicação e voz pública.
- **Acadêmico**, se o centro for pesquisa, universidade e produção formal de conhecimento.

Nunca retornar:
- Especialista

---

## 6. O que fazer se a fala parecer "operador"

O sistema **NÃO** deve criar a categoria "Operador".

Se a pessoa falar sobre execução, operação, processos, rotina ou "colocar a mão na massa", o sistema deve decidir entre as 7 categorias oficiais.

### Exemplos

#### Caso 1

A pessoa fala:

> "Gosto de organizar a operação e fazer a empresa funcionar melhor."

Decisão provável:
- **Executivo**, se o foco for liderar área, time, operação ou responder por resultado.
- **Consultor**, se o foco for resolver esse tipo de problema para clientes externos.
- **Sucessor**, se estiver dentro da empresa da família com lógica de continuidade.

Nunca retornar:
- Operador

---

#### Caso 2

A pessoa fala:

> "Quero tocar a operação da empresa da minha família."

Decisão provável:
- **Sucessor**, se o foco for continuidade, legado ou papel familiar.
- **Executivo**, se o foco for função organizacional e gestão profissional.

Nunca retornar:
- Operador

---

## 7. O que fazer se a fala parecer "alocador" ou "investidor"

O sistema **NÃO** deve criar a categoria "Alocador".

Se a pessoa falar sobre patrimônio, investimento, capital, holding, participação societária ou conselho, o sistema deve decidir entre as 7 categorias oficiais ou marcar ambiguidade interna.

### Exemplos

#### Caso 1

A pessoa fala:

> "Quero cuidar do patrimônio da família e participar das decisões estratégicas."

Decisão provável:
- **Sucessor**, se isso estiver ligado a continuidade familiar, governança e papel geracional.
- **Executivo**, se houver função de gestão ativa dentro de organização.
- **Consultor**, se a pessoa quiser ajudar outras famílias ou empresas com esse tipo de decisão.

Nunca retornar:
- Alocador
- Investidor

---

#### Caso 2

A pessoa fala:

> "Quero investir em empresas e montar um portfólio."

Decisão provável:
- Se isso estiver ligado a criar uma empresa de investimento própria com risco e construção de negócio → **Empreendedor**
- Se estiver ligado a atuar profissionalmente em uma organização de investimentos → **Executivo**
- Se estiver ligado a família empresária, governança e continuidade patrimonial → **Sucessor**

Nunca retornar:
- Alocador
- Investidor

---

## 8. Como o agente lida com fases sem saber a fase upfront

O agente conversacional **NÃO** deve tentar saber a fase da pessoa antes da conversa.

Ele também **NÃO** deve adaptar a conversa tentando adivinhar a fase em tempo real.

A conversa deve usar perguntas universais, simples e concretas, capazes de gerar sinais para qualquer fase.

A fase será inferida depois pelo Claude / motor de análise, com base na transcrição completa.

### Regra oficial

- O agente coleta.
- O motor de análise interpreta.
- A fase emerge depois.

### O agente NÃO deve dizer

- "Parece que você está em Exploração."
- "Talvez você esteja em Direção."
- "Vou te fazer perguntas específicas para sua fase."
- "Sua fase provavelmente é…"

Durante a conversa, o agente não interpreta, não classifica e não devolve conclusão.

---

## 9. As 4 fases de carreira — definição oficial

A fase representa como a pessoa se relaciona com identidade, construção e decisão profissional.

As únicas fases válidas são:

1. Exploração
2. Direção
3. Consolidação
4. Transição

**Autoria e Reposicionamento foram removidas** por gerarem ambiguidade de classificação. Autoria é absorvida por Direção. Reposicionamento é absorvido por Transição (ou Exploração quando o campo foi reaberto).

### Idade como prior de fase

A idade da pessoa é um sinal auxiliar — não determinante, mas útil como prior quando os sinais da conversa forem ambíguos. Se a fala for clara, ela prevalece. Se for ambígua, a faixa de idade inclina a decisão.

| Fase | Faixa de referência | Contexto típico |
|---|---|---|
| Exploração | 18–28 | Recém-formado, primeiro contato com o mercado, saiu de algo e está recomeçando |
| Direção | 24–35 | Tem uma aposta emergindo, construindo convicção sobre o caminho |
| Consolidação | 30–50 | Trajetória definida, foco em tração, profundidade e crescimento |
| Transição | 38+ | Pós-construção — revisando o que faz sentido ou orientando para impacto duradouro |

**Importante:** as faixas se sobrepõem propositalmente. Uma pessoa de 22 pode estar em Direção. Uma de 48 pode estar em Exploração depois de uma mudança de carreira. A idade é um prior, não uma regra.

---

### Exploração

**Faixa de referência:** 18–28 (não absoluta)

**O que é:**
A pessoa está num momento de campo aberto — muitas possibilidades, poucas apostas firmes. A identidade profissional está sendo testada mais do que construída. Também cobre quem saiu de um caminho anterior e reabriu o campo.

**Sinais na fala:**
- Muitas possibilidades abertas ao mesmo tempo
- Busca de repertório, referências, experiências
- Pouco compromisso com uma direção específica
- Curiosidade difusa, medo de escolher errado
- Algo deixou de fazer sentido e a pessoa está recalibrando o ponto de partida

**Falas típicas:**
> "Ainda estou tentando entender o que combina comigo."
> "Tenho muitas possibilidades."
> "Não sei o que eu quero fazer."
> "Isso já não faz tanto sentido, preciso reavaliar."
> "Acho que preciso atualizar minha rota."

---

### Direção

**Faixa de referência:** 24–35 (não absoluta)

**O que é:**
A pessoa tem uma aposta — um caminho que parece mais verdadeiro do que os outros. O trabalho agora é converter essa convicção em construção real. Também cobre quem sente tensão entre o que quer construir e o que se espera dela (o que antes era Autoria).

**Sinais na fala:**
- Um vetor começa a aparecer com mais força
- Quer priorizar, precisa escolher onde colocar energia
- Ainda construindo a convicção, mas já tem uma aposta
- Tensão entre desejo próprio e expectativa externa
- Dúvida sobre o que é dela e o que veio de fora

**Falas típicas:**
> "Acho que esse caminho faz mais sentido."
> "Quero testar isso com mais intenção."
> "Preciso decidir onde coloco energia."
> "Não sei se isso é meu ou se é o que esperam de mim."
> "Quero construir algo com minha assinatura."

---

### Consolidação

**Faixa de referência:** 30–50 (não absoluta)

**O que é:**
A trajetória está em movimento — há um caminho definido e a pessoa está construindo tração, competência e consistência ao longo dele. A pergunta não é mais "para onde vou" mas "como sustento e aprofundo o que estou construindo".

**Sinais na fala:**
- Caminho já definido
- Foco em consistência, execução e profundidade
- Pergunta sobre como sustentar e crescer no caminho
- Construção ativa de reputação, resultado ou escala

**Falas típicas:**
> "Já sei o que estou construindo, mas preciso ganhar tração."
> "Quero sustentar melhor esse caminho."
> "Preciso transformar isso em rotina e resultado."
> "Quero aprofundar o que já comecei."

---

### Transição

**Faixa de referência:** 38+ (não absoluta)

**O que é:**
A pessoa está num momento em que algo mudou ou está mudando na sua relação com a carreira. Cobre dois padrões que aparecem na mesma faixa etária pós-construção:

1. **Orientação para impacto duradouro:** a pergunta deixou de ser "o que eu vou fazer" e passou a ser "o que eu quero que dure" — construção para além do desempenho individual.
2. **Recalibração pós-capítulo:** algo chegou ao fim, um capítulo se fechou, e a pessoa está desenhando o próximo — com mais experiência e menos urgência do que na Exploração.

O que une os dois: ambos acontecem depois que a pessoa já construiu algo. Não é início de trajetória — é revisão ou reorientação de uma trajetória que já existe.

**Sinais na fala:**
- Orientação para impacto, contribuição, algo que dure além de si
- Algo deixou de fazer sentido depois de um ciclo longo
- Pergunta sobre o que importa construir agora
- Vontade de transmitir, formar, institucionalizar
- Cansaço com o que já foi consolidado, busca de novo significado

**Falas típicas:**
> "Quero deixar algo."
> "Quero construir algo que dure além de mim."
> "Esse capítulo chegou ao fim — estou pensando no que vem depois."
> "Não quero apenas crescer — quero que isso signifique algo."
> "Quero contribuir de uma forma diferente do que venho fazendo."

---

## 10. Índice de clareza de trajetória — definição oficial

O índice mede **o quanto a pessoa parece consciente da trajetória profissional que está construindo**. Não mede sucesso, maturidade ou qualidade de decisão.

Dois critérios. Cada um recebe 0 ou 1. Total: 0 a 2 pontos.

| Pontos | Label |
|---|---|
| 0 | Incerta |
| 1 | Em formação |
| 2 | Clara |

---

### Critério 1 — Nomeação da trajetória

**Pergunta:** A pessoa consegue nomear a trajetória profissional que está construindo?

**0 pontos** — A pessoa não nomeia ou usa termos completamente abertos.

Falas típicas:
> "Não sei."
> "Talvez várias coisas."
> "Ainda estou perdido."
> "Estou aberto a tudo."

**1 ponto** — A pessoa nomeia uma trajetória reconhecível com suas próprias palavras.

Falas típicas:
> "Quero empreender."
> "Quero seguir carreira executiva."
> "Quero construir minha própria carteira como profissional liberal."
> "Quero criar conteúdo e construir audiência."
> "Quero continuar na empresa da família e assumir um papel de liderança."

---

### Critério 2 — Critério próprio

**Pergunta:** A justificativa da pessoa para essa trajetória vem de dentro dela?

**0 pontos** — A justificativa vem quase toda de fora (expectativa, segurança, pressão familiar, caminho óbvio).

Falas típicas:
> "É o que esperam de mim."
> "É o caminho mais seguro."
> "Minha família acha que faz sentido."
> "Parece o caminho natural."

**1 ponto** — A pessoa consegue explicar por que essa trajetória faz sentido para ela com palavras próprias.

Falas típicas:
> "Esse caminho me dá energia porque gosto de construir do zero."
> "Quero liderar porque gosto de coordenar pessoas e responder pelo conjunto."
> "Conteúdo faz sentido porque eu gosto de organizar ideias publicamente."
> "A empresa da família importa porque vejo uma oportunidade real de transformação."

---

## 11. Como o agente captura sinal para o índice de clareza

Para que o motor de inferência possa calcular o índice de clareza, o agente precisa provocar a pessoa a nomear sua trajetória e a explicar por que ela faz sentido.

A pergunta direta deve aparecer no bloco de Direção e Futuro Profissional:

> "Se você tivesse que nomear o caminho profissional que está construindo — ou que quer construir — como você descreveria?"

Seguida de aprofundamento se a pessoa nomear algo:

> "E por que esse caminho faz sentido pra você?"

Sem essas perguntas, o motor vai inferir o índice a partir de sinais indiretos — o que é menos preciso.

---

## 12. Como o agente lida com as 4 fases sem saber a fase upfront

O agente faz perguntas universais que geram sinal para qualquer fase.

As perguntas do bloco 1 (contexto profissional) e bloco 2 (movimentos e experiências) capturam sinais de Exploração e Consolidação naturalmente.

As perguntas do bloco 3 (direção e futuro) — especialmente a pergunta de nomeação de trajetória — capturam sinal para Direção e Legado.

O bloco 4 (fricções e desafios) captura sinais de tensão que complementam a fase.

A fase é inferida depois pelo motor de análise com base na transcrição completa.

---

## 13. JSON de saída — schema oficial

O sistema deve gerar um JSON formal, com campos consistentes.

```json
{
  "phase": {
    "name": "Direção",
    "short_description": "O que aparece na sua fala é alguém que já tem uma aposta — você sabe para onde quer ir, mas ainda está construindo a convicção de que esse caminho é realmente seu.",
    "confidence": 0.82,
    "evidence": [
      "A pessoa nomeou uma trajetória clara",
      "A pessoa expressou tensão entre desejo próprio e expectativa externa"
    ]
  },
  "pathway": {
    "name": "Empreendedor",
    "short_description": "O que chama atenção é a combinação de energia para criar do zero com a dificuldade de se encaixar em estruturas que não são suas — isso é traço de quem constrói melhor quando tem autonomia real.",
    "confidence": 0.78,
    "evidence": [
      "A pessoa mencionou vontade de criar algo próprio",
      "A pessoa falou em dificuldade com hierarquias rígidas"
    ]
  },
  "clarity": {
    "score_1_to_3": 2,
    "label": "Em formação",
    "total_points_0_to_2": 1,
    "criteria": {
      "direction_naming": {
        "score_0_to_1": 1,
        "evidence": "A pessoa nomeou empreendedorismo como caminho principal."
      },
      "own_criteria": {
        "score_0_to_1": 0,
        "evidence": "A justificativa ainda mistura desejo próprio com expectativa do ambiente."
      }
    }
  },
  "tension": {
    "name": "Dependência de validação",
    "short_description": "O maior obstáculo agora parece ser a necessidade de ter confirmação externa antes de avançar — o caminho já está mais claro do que a confiança para percorrê-lo.",
    "confidence": 0.84,
    "evidence": [
      "A pessoa mencionou buscar aprovação antes de decidir",
      "A pessoa falou em medo de errar a escolha"
    ]
  },
  "actions": [
    {
      "type": "para_dentro",
      "title": "Escreva sua versão do caminho",
      "description": "Pegue 20 minutos e escreva: 'O caminho que faz sentido pra mim é [X] porque...' — usando as mesmas palavras que você usou na conversa hoje.",
      "why_this_action": "Separar o que você quer do que esperam de você começa colocando isso no papel com suas próprias palavras.",
      "timeframe": "7 dias"
    },
    {
      "type": "para_fora",
      "title": "Converse com alguém que escolheu esse caminho",
      "description": "Mande mensagem para alguém que você admira e que está construindo a trajetória que você mencionou. Pergunte: qual foi o momento em que isso virou aposta real pra você?",
      "why_this_action": "Ver como outra pessoa passou pela mesma virada é mais útil do que continuar analisando sozinho.",
      "timeframe": "7 dias"
    },
    {
      "type": "prototipar",
      "title": "Teste o caminho por uma semana",
      "description": "Escolha uma ação concreta ligada ao caminho que você nomeou. Faça por 30 minutos por dia durante 7 dias — sem compromisso definitivo, só para gerar dados reais.",
      "why_this_action": "Uma semana de experiência concreta vale mais do que semanas de análise sobre o que pode ou não funcionar.",
      "timeframe": "7 dias"
    }
  ],
  "metadata": {
    "anxiety_score_1_to_5": 3,
    "conversation_duration_seconds": 260,
    "mentioned_people": ["pai", "amigo do setor"],
    "mentioned_projects": ["startup de educação"],
    "raw_summary": "A pessoa está construindo convicção em torno de uma trajetória empreendedora, mas ainda busca validação externa antes de apostar com mais força."
  }
}
```

---

## 14. Regra sobre os 4 perfis antigos

Os 4 perfis antigos **NÃO** se aplicam mais.

Eles devem ser removidos completamente da lógica do produto.

Perfis antigos:
- Paralisado por Opção
- Atrasado
- Executor sem Norte
- Esperando Permissão

Eles não devem aparecer como output, lógica interna, categoria, perfil, rótulo, tela, explicação, fallback, nome de tensão, tag, variável, prompt, JSON.

---

## 15. Como os perfis antigos foram absorvidos

| Perfil antigo | Absorvido por |
|---|---|
| Paralisado por Opção | tensão: Excesso de possibilidades |
| Atrasado | tensão: Comparação constante |
| Executor sem Norte | tensão: Movimento sem direção |
| Esperando Permissão | tensão: Dependência de validação / Autonomia vs lealdade familiar |

Esse mapeamento é apenas registro histórico. O sistema novo **NÃO** deve mencionar os perfis antigos.

---

## 16. Decisão final

A arquitetura oficial do produto agora é:

1. **Fase** (4 opções: Exploração · Direção · Consolidação · Transição)
2. **Trajetória** (7 opções)
3. **Índice de clareza de trajetória** (3 níveis: Incerta · Em formação · Clara)
4. **Tensão** (8 opções)
5. **Ações** (3 — uma de cada tipo: para_dentro · para_fora · prototipar)

Não usar mais:
- perfis antigos
- arquétipos
- categorias híbridas
- operador, alocador, especialista
- fases Autoria, Reposicionamento e Legado (substituída por Transição)

O produto deve permanecer **simples, editorial, humano e não classificatório.**
