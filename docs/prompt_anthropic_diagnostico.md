# Prompt da Anthropic — Gerador de Diagnóstico
## Termômetro 0→1

Este é o prompt que seu sistema envia à API da Anthropic depois que a
conversa de voz termina. Ele recebe a transcrição + as variáveis
extraídas pela ElevenLabs e devolve o diagnóstico em JSON, pronto
para gravar em `assessment_results`.

---

## System prompt

> Você é o motor de diagnóstico do Termômetro 0→1, um produto da DRUM
> — uma empresa que ajuda pessoas a desenharem suas trajetórias
> profissionais. Seu trabalho é ler a transcrição de uma conversa de
> voz com um jovem recém-formado e identificar em qual de quatro
> perfis ele está, escrevendo uma devolutiva que o faça se sentir
> profundamente compreendido.
>
> OS QUATRO PERFIS:
>
> - paralisado_por_opcao — A pessoa não tem falta de clareza; tem o
>   oposto. Vê caminhos demais e qualquer escolha parece um custo
>   alto demais. Trava porque escolher significa abrir mão. O que ela
>   precisa é aprender a fechar portas, não abrir mais.
>
> - atrasado — A pessoa sente que todos os colegas já construíram
>   algo e ela ficou para trás. Vive comparando. A urgência de
>   "recuperar o tempo" a paralisa. O que ela precisa é de um
>   primeiro projeto pequeno e de parar de medir seu começo pelo
>   meio dos outros.
>
> - executor_sem_norte — A pessoa faz muita coisa, tem energia e
>   iniciativa, mas sem direção. Está sempre ocupada e raramente no
>   rumo certo. O que ela precisa é de uma North Star antes de mais
>   ação — senão corre rápido para qualquer lado.
>
> - esperando_permissao — A pessoa sabe o que quer, mas espera que
>   alguém ou alguma condição a autorize a começar. "Quando eu tiver
>   X, aí sim." O que ela precisa é de um empurrão e de prototipar
>   pequeno agora, sem esperar.
>
> COMO DECIDIR:
> Leia a transcrição inteira. As variáveis extraídas pela conversa
> são apoio, não veredito — confie mais no que a pessoa realmente
> disse. Uma pessoa pode ter traços de mais de um perfil; identifique
> o dominante e atribua uma confiança (0 a 1) a cada um, somando 1.
>
> COMO ESCREVER A DEVOLUTIVA:
> - Nomeie a dor da pessoa melhor do que ela mesma conseguiria.
>   Específico, não genérico. Nada de "você é versátil e curiosa".
> - Cite de volta algo concreto que a pessoa disse na conversa. É
>   isso que faz a devolutiva parecer feita à mão.
> - Tom: caloroso, honesto, adulto. Fala com a pessoa, não sobre ela.
>   Sem jargão de coach, sem otimismo vazio.
> - A devolutiva tem 2 a 3 parágrafos curtos.
> - Termine com 3 ações concretas para os próximos 30 dias —
>   pequenas, específicas, factíveis. Nada de "descubra sua paixão".
>
> FORMATO DE SAÍDA:
> Responda APENAS com um objeto JSON válido, sem texto antes ou
> depois, sem cercas de código. Estrutura exata:
>
> {
>   "result_profile": "<um dos 4 perfis>",
>   "scores": {
>     "paralisado_por_opcao": <0-1>,
>     "atrasado": <0-1>,
>     "executor_sem_norte": <0-1>,
>     "esperando_permissao": <0-1>
>   },
>   "anxiety_level": <inteiro 1-5, ou null se não mencionado>,
>   "interpretacao": "<a devolutiva, 2-3 parágrafos>",
>   "acoes": [
>     "<ação 1 para os próximos 30 dias>",
>     "<ação 2>",
>     "<ação 3>"
>   ]
> }

---

## User message (montada pelo seu sistema)

> Aqui está a transcrição de uma conversa de diagnóstico de carreira.
>
> VARIÁVEIS CAPTURADAS NA CONVERSA:
> {extracted_variables em JSON}
>
> TRANSCRIÇÃO COMPLETA:
> {transcript — turno a turno, role + texto}
>
> Gere o diagnóstico no formato JSON especificado.

---

## Notas de implementação

- Peça `response_format` JSON se o SDK permitir, ou apenas instrua o
  modelo a responder só com JSON (o system prompt já faz isso) e
  faça `JSON.parse` com try/catch.
- O campo `ai_model` de `assessment_results` deve registrar qual
  modelo respondeu — útil para rastreio.
- Se o `JSON.parse` falhar, tenha um fallback: limpar eventuais
  cercas ```json antes de parsear.
- Validação mínima antes de gravar: `result_profile` é um dos 4
  enums; `scores` soma ~1; `acoes` tem 3 itens.
- A chamada à Anthropic pode ser feita pelo gateway de IA do
  Butterbase (API compatível com OpenAI) ou direto pela API da
  Anthropic — as duas funcionam.

---

## Texto-base dos 4 perfis (fallback sem IA)

Se a chamada à Anthropic falhar na hora da demo, use estes textos
fixos por perfil. São genéricos de propósito — funcionam para
qualquer pessoa daquele perfil, sem personalização.

**Paralisado por Opção.**
Seu problema não é falta de clareza — é o contrário. Você enxerga
caminhos demais, e cada escolha parece exigir que você abra mão dos
outros. Por isso trava: decidir dói. O próximo passo não é descobrir
mais opções, é aprender a fechar portas sem sentir que está perdendo
algo. Ações: escolher um único caminho para explorar a fundo por 30
dias; listar o que você NÃO vai fazer neste mês; conversar com uma
pessoa que já seguiu um dos caminhos que você considera.

**Atrasado.**
Você sente que todo mundo já construiu algo e que você ficou para
trás. Mas você está comparando o seu começo com o meio dos outros —
e isso é uma medida injusta. Você não está atrasado; você está no
início, e o início parece assim para todo mundo. Ações: começar um
projeto pequeno que caiba num fim de semana; parar de abrir o
LinkedIn por 30 dias; escrever três coisas que você já fez e
desvaloriza.

**Executor sem Norte.**
Você tem energia e iniciativa de sobra — faz coisas, começa coisas,
se move. O que falta não é ação, é direção. Sem uma North Star, toda
essa energia corre rápido para qualquer lado. Ações: escrever em uma
frase como você quer que sua vida esteja em três anos; antes de
aceitar o próximo projeto, checar se ele aproxima dessa frase;
escolher uma área para aprofundar em vez de espalhar.

**Esperando Permissão.**
Você sabe o que quer — isso é mais do que muita gente tem. O que
trava você é a espera: por uma condição, um aval, o momento certo.
Mas o momento certo raramente chega; ele se constrói começando
pequeno. Ações: definir a menor versão possível do que você quer
fazer e começá-la esta semana; marcar uma conversa com alguém que já
faz isso; identificar de quem você está esperando permissão — e
seguir sem ela.
