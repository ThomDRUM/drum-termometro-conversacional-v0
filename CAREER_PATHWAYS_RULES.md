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
- "Talvez você esteja em Autoria."
- "Vou te fazer perguntas específicas para sua fase."
- "Sua fase provavelmente é…"

Durante a conversa, o agente não interpreta, não classifica e não devolve conclusão.

---

## 9. Como a fase deve ser inferida

A fase deve ser inferida depois da conversa a partir de:

- relação da pessoa com escolha
- relação da pessoa com identidade
- relação da pessoa com construção
- conflitos centrais
- sinais de clareza
- sinais de travamento
- horizonte futuro
- linguagem usada
- exemplos concretos

### Exploração

Sinais:
- muitas possibilidades
- busca de repertório
- pouco compromisso
- curiosidade difusa
- medo de escolher errado

Falas típicas:
> "Ainda estou tentando entender o que combina comigo."  
> "Tenho muitas possibilidades."  
> "Não sei o que eu quero fazer."

---

### Direção

Sinais:
- começa a aparecer um vetor
- quer priorizar
- precisa escolher uma aposta
- já não quer todas as portas igualmente abertas

Falas típicas:
> "Acho que esse caminho faz mais sentido."  
> "Quero testar isso com mais intenção."  
> "Preciso decidir onde coloco energia."

---

### Autoria

Sinais:
- tensão entre desejo próprio e expectativa externa
- dúvida sobre o que é dela e o que é herdado
- necessidade de se autorizar

Falas típicas:
> "Não sei se isso é meu ou se é o que esperam de mim."  
> "Tenho medo de decepcionar."  
> "Quero construir algo com minha assinatura."

---

### Consolidação

Sinais:
- já existe caminho
- foco em consistência, competência e tração
- pergunta sobre sustentar o caminho

Falas típicas:
> "Já sei o que estou construindo, mas preciso ganhar tração."  
> "Quero sustentar melhor esse caminho."  
> "Preciso transformar isso em rotina e resultado."

---

### Reposicionamento

Sinais:
- algo deixou de fazer sentido
- revisão de rota
- desencaixe entre trajetória atual e identidade emergente

Falas típicas:
> "Isso já não faz tanto sentido."  
> "Acho que preciso atualizar minha rota."  
> "Não sei se é ajuste ou recomeço."

---

### Legado

Sinais:
- contribuição
- transmissão
- impacto
- continuidade
- orientação para algo maior que desempenho individual

Falas típicas:
> "Quero deixar algo."  
> "Quero contribuir mais."  
> "Quero entender para que estou construindo isso."

---

## 10. Índice de clareza — necessidade de âncoras

O índice de clareza deve ser calculado com base nos 5 critérios já definidos.

Cada critério recebe:

- 0 = ausente
- 1 = parcialmente presente
- 2 = claramente presente

Total: 0 a 10 pontos

Conversão:
- 0–2 = Difusa
- 3–4 = Emergente
- 5–6 = Em construção
- 7–8 = Clara
- 9–10 = Muito clara

---

## 11. Critério 1 — Nomeação da direção

Pergunta: A pessoa consegue nomear um caminho reconhecível?

### 0 pontos

A pessoa não consegue nomear direção.

Falas típicas:
> "Não sei."  
> "Talvez várias coisas."  
> "Ainda estou perdido."  
> "Não tenho ideia."  
> "Estou aberto a tudo."

### 1 ponto

Existem possibilidades mais fortes, mas ainda muito abertas.

Falas típicas:
> "Acho que talvez empreendedorismo."  
> "Me vejo um pouco em produto."  
> "Tenho pensado em trabalhar com empresas."  
> "Gosto de educação, mas não sei em que formato."  
> "Talvez eu queira algo mais autoral."

### 2 pontos

A pessoa consegue nomear uma direção principal claramente.

Falas típicas:
> "Quero construir uma trajetória empreendedora."  
> "Quero assumir papel na empresa da família."  
> "Quero seguir carreira executiva."  
> "Quero construir uma carreira como consultor."  
> "Quero viver de conteúdo e construir audiência."

---

## 12. Critério 2 — Coerência da fala

Pergunta: As falas apontam para uma direção dominante?

### 0 pontos

A fala é muito contraditória ou dispersa.

Exemplos:
> "Quero empreender, mas também quero concurso, talvez academia, talvez empresa da família."  
> "Tudo me interessa igual."  
> "Não sei se quero estabilidade, risco, autonomia ou liderança."

### 1 ponto

Existe alguma coerência, mas ainda com oscilação.

Exemplos:
> "Falo bastante de criar projetos, mas também tenho dúvida se quero uma empresa."  
> "Acho que gosto de liderar, mas ainda não sei se quero isso numa empresa ou no negócio da família."  
> "Tenho caminhos que se repetem, mas ainda não sei qual pesa mais."

### 2 pontos

As falas convergem claramente para uma direção dominante.

Exemplos:
> A pessoa fala repetidamente de criar, testar, validar e lançar algo próprio.  
> A pessoa fala repetidamente de continuidade, empresa da família e transição geracional.  
> A pessoa fala repetidamente de liderança, área, time e resultado.  
> A pessoa fala repetidamente de conteúdo, audiência e voz pública.

---

## 13. Critério 3 — Critério próprio

Pergunta: A pessoa consegue explicar por que esse caminho faz sentido para ela?

### 0 pontos

A justificativa vem quase toda de fora.

Falas típicas:
> "É o que esperam de mim."  
> "É o caminho mais seguro."  
> "Todo mundo fala que é uma boa opção."  
> "Minha família acha que faz sentido."  
> "Parece o caminho certo."

### 1 ponto

Existem critérios parcialmente próprios, mas ainda misturados com expectativa externa.

Falas típicas:
> "Acho que combina comigo, mas também pesa o que minha família espera."  
> "Gosto disso, mas não sei se é desejo meu ou influência do ambiente."  
> "Vejo sentido, mas ainda busco muita validação."

### 2 pontos

A pessoa explica com clareza uma motivação própria.

Falas típicas:
> "Esse caminho me dá energia porque gosto de construir do zero."  
> "Quero liderar porque gosto de coordenar pessoas e responder pelo conjunto."  
> "A empresa da família importa para mim porque vejo uma oportunidade real de continuidade e transformação."  
> "Conteúdo faz sentido porque eu gosto de organizar ideias publicamente."

---

## 14. Critério 4 — Movimento concreto

Pergunta: Existe alguma movimentação prática coerente com a direção?

### 0 pontos

Nenhum movimento concreto.

Falas típicas:
> "Ainda não fiz nada."  
> "Estou só pensando."  
> "Tenho vontade, mas não comecei."  
> "Ainda estou pesquisando."

### 1 ponto

Existem movimentos pequenos, pontuais ou inconsistentes.

Falas típicas:
> "Conversei com algumas pessoas."  
> "Comecei um projeto, mas parei."  
> "Fiz um curso."  
> "Tenho anotado ideias."  
> "Testei uma vez, mas não dei continuidade."

### 2 pontos

Existem projetos, experiências ou responsabilidades coerentes com a direção.

Falas típicas:
> "Já estou tocando um projeto nessa área."  
> "Tenho conversado com clientes."  
> "Assumi uma frente na empresa."  
> "Publiquei conteúdos por algumas semanas."  
> "Estou liderando uma iniciativa relacionada a isso."  
> "Já testei essa ideia com pessoas reais."

---

## 15. Critério 5 — Sustentação da ambiguidade

Pergunta: A pessoa consegue sustentar uma direção sem precisar ter certeza absoluta?

### 0 pontos

A pessoa precisa de certeza total antes de se mover.

Falas típicas:
> "Só vou decidir quando tiver certeza."  
> "Tenho medo de escolher errado."  
> "Preciso saber se é o caminho certo antes de começar."  
> "Não quero arriscar sem garantia."

### 1 ponto

A pessoa tolera alguma ambiguidade, mas muda facilmente ou trava.

Falas típicas:
> "Até consigo testar, mas fico duvidando o tempo todo."  
> "Começo, mas logo penso em trocar."  
> "Se aparece outra possibilidade, eu me confundo."  
> "Consigo avançar um pouco, mas ainda preciso de muita confirmação."

### 2 pontos

A pessoa consegue sustentar direção mesmo sem certeza absoluta.

Falas típicas:
> "Não tenho todas as respostas, mas quero testar isso por um período."  
> "Sei que posso ajustar depois."  
> "Quero avançar mesmo sem certeza total."  
> "Não preciso decidir a vida inteira agora, mas esse caminho merece energia."

---

## 16. JSON de saída

O sistema deve gerar um JSON formal, com campos consistentes.

A UI pode mostrar apenas uma versão simplificada, mas o backend deve manter estrutura clara.

Schema oficial:

```json
{
  "phase": {
    "name": "Autoria",
    "short_description": "Você parece estar tentando diferenciar o que realmente faz sentido para você daquilo que veio como expectativa externa.",
    "confidence": 0.82,
    "evidence": [
      "A pessoa mencionou medo de decepcionar a família",
      "A pessoa questionou se a escolha é realmente dela"
    ]
  },
  "pathway": {
    "name": "Sucessor",
    "short_description": "O caminho que mais parece emergir é assumir um papel mais claro no negócio da família.",
    "confidence": 0.78,
    "evidence": [
      "A pessoa falou sobre continuidade da empresa da família",
      "A pessoa mencionou modernizar o negócio sem romper com a história"
    ]
  },
  "clarity": {
    "score_1_to_5": 3,
    "label": "Em construção",
    "total_points_0_to_10": 6,
    "criteria": {
      "direction_naming": {
        "score_0_to_2": 1,
        "evidence": "A pessoa fala em empresa da família, mas ainda não nomeia claramente o papel que quer assumir."
      },
      "speech_coherence": {
        "score_0_to_2": 2,
        "evidence": "A fala converge para continuidade e papel no negócio familiar."
      },
      "own_criteria": {
        "score_0_to_2": 1,
        "evidence": "Existe desejo próprio, mas ainda misturado com expectativa familiar."
      },
      "concrete_movement": {
        "score_0_to_2": 1,
        "evidence": "A pessoa já participou de algumas conversas, mas ainda não assumiu projeto concreto."
      },
      "ambiguity_tolerance": {
        "score_0_to_2": 1,
        "evidence": "A pessoa aceita conversar sobre o tema, mas ainda busca confirmação externa."
      }
    }
  },
  "tension": {
    "name": "Autonomia vs lealdade familiar",
    "short_description": "O principal desafio parece ser construir um caminho próprio sem sentir que isso rompe o vínculo com a família.",
    "confidence": 0.84,
    "evidence": [
      "A pessoa mencionou medo de decepcionar",
      "A pessoa falou em culpa ao pensar diferente"
    ]
  },
  "actions": [
    {
      "type": "para_dentro",
      "title": "Escreva sua versão do papel na empresa",
      "description": "Escreva um parágrafo começando com: 'Se eu entrasse na empresa da família do meu jeito, eu começaria por...'.",
      "why_this_action": "Ajuda a separar desejo próprio de expectativa familiar.",
      "timeframe": "7 dias"
    },
    {
      "type": "para_fora",
      "title": "Converse com alguém da geração anterior",
      "description": "Mande mensagem para a pessoa da família que você citou e pergunte qual decisão profissional foi mais difícil para ela entre os 25 e 35 anos.",
      "why_this_action": "Cria uma conversa concreta sobre expectativa, trajetória e pertencimento.",
      "timeframe": "7 dias"
    },
    {
      "type": "prototipar",
      "title": "Monte uma proposta pequena",
      "description": "Escolha um problema pequeno da empresa que você mencionou e monte um slide com uma melhoria possível.",
      "why_this_action": "Testa autoria dentro do contexto familiar sem exigir uma decisão definitiva.",
      "timeframe": "7 dias"
    }
  ],
  "metadata": {
    "anxiety_score_1_to_5": 4,
    "conversation_duration_seconds": 260,
    "mentioned_people": ["pai", "irmã"],
    "mentioned_projects": ["nova frente digital"],
    "raw_summary": "A pessoa está avaliando um possível papel no negócio familiar, com desejo de contribuir, mas receio de perder autonomia."
  }
}
```

---

## 17. Regra sobre os 4 perfis antigos

Os 4 perfis antigos **NÃO** se aplicam mais.

Eles devem ser removidos completamente da lógica do produto.

Perfis antigos:
- Paralisado por Opção
- Atrasado
- Executor sem Norte
- Esperando Permissão

Eles não devem aparecer como:
- output
- lógica interna
- categoria
- perfil
- rótulo
- tela
- explicação
- fallback
- nome de tensão
- tag
- variável
- prompt
- JSON

---

## 18. Como os perfis antigos foram absorvidos

O melhor desses perfis foi absorvido pelo novo sistema de tensões.

Mapeamento conceitual (apenas histórico — não usar no sistema):

| Perfil antigo | Absorvido por |
|---|---|
| Paralisado por Opção | tensão: Excesso de possibilidades |
| Atrasado | tensão: Comparação constante |
| Executor sem Norte | tensão: Movimento sem direção |
| Esperando Permissão | tensão: Dependência de validação / Autonomia vs lealdade familiar |

Esse mapeamento é apenas registro histórico. O sistema novo **NÃO** deve mencionar os perfis antigos.

---

## 19. Decisão final

A arquitetura oficial do produto agora é:

1. **Fase**
2. **Trajetória**
3. **Índice de clareza**
4. **Tensão**
5. **Ações**

Não usar mais:
- perfis antigos
- arquétipos
- categorias híbridas
- operador
- alocador
- especialista

O produto deve permanecer **simples, editorial, humano e não classificatório.**
