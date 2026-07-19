const progressRow = document.querySelector("#progressRow");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const questionCard = document.querySelector("#questionCard");
const backButton = document.querySelector("#backButton");
const schedulerSectionEl = document.querySelector("#agenda");
const calendlyEmbedEl = document.querySelector("#calendlyEmbed");

const WHATSAPP_NUMBER = "5519982404418";
const CALENDLY_URL = window.LM_CALENDLY_URL || "https://calendly.com/lucas-mseg/30min";

const state = {
  step: 0,
  answers: [],
  lead: {
    name: "",
    email: "",
    phone: "",
    consent: false,
  },
};

const questions = [
  {
    title: "Como você gera sua renda hoje?",
    options: [
      { label: "Autônomo / profissional liberal", value: "Autônomo / profissional liberal", score: 3 },
      { label: "Empresário", value: "Empresário", score: 3 },
      { label: "CLT", value: "CLT", score: 1 },
    ],
  },
  {
    title: "Sua renda depende diretamente do seu trabalho diário?",
    options: [
      { label: "Totalmente", value: "Depende totalmente do trabalho diário", score: 3 },
      { label: "Parcialmente", value: "Depende parcialmente do trabalho diário", score: 2 },
      { label: "Não", value: "Não depende diretamente do trabalho diário", score: 0 },
    ],
  },
  {
    title: "Se você ficasse afastado, sua renda continuaria entrando?",
    options: [
      { label: "Não continuaria", value: "Renda não continuaria em caso de afastamento", score: 3 },
      { label: "Só por pouco tempo", value: "Renda continuaria por pouco tempo", score: 2 },
      { label: "Sim, tenho proteção", value: "Tem proteção para afastamento", score: 0 },
    ],
  },
  {
    title: "Você tem filhos ou dependentes financeiros?",
    options: [
      { label: "Sim", value: "Tem filhos ou dependentes financeiros", score: 3 },
      { label: "Não", value: "Não tem dependentes financeiros", score: 0 },
    ],
  },
  {
    title: "Quanto tempo sua reserva financeira sustenta seu padrão de vida?",
    options: [
      { label: "Não tenho reserva", value: "Não tem reserva financeira", score: 3 },
      { label: "Até 3 meses", value: "Reserva sustenta até 3 meses", score: 2 },
      { label: "Mais de 6 meses", value: "Reserva sustenta mais de 6 meses", score: 0 },
    ],
  },
  {
    title: "Você já possui algum seguro hoje?",
    note: "Se já tem, podemos analisar sua apólice atual antes de prosseguir.",
    options: [
      { label: "Não tenho", value: "Não possui seguro hoje", score: 2 },
      { label: "Tenho, mas não sei se cobre o que preciso", value: "Tem seguro, mas não sabe se cobre o necessário", score: 2 },
      { label: "Tenho e confio", value: "Tem seguro e confia na cobertura", score: 0 },
    ],
  },
];

const totalSteps = 7;
const padStep = (index) => String(index + 1).padStart(2, "0");
const getScore = () => state.answers.reduce((sum, answer) => sum + answer.score, 0);

const getRisk = () => {
  const score = getScore();
  if (score >= 13) {
    return {
      label: "Perfil alto risco",
      title: "Hoje sua renda está totalmente exposta",
      text: "Se você parar de trabalhar, sua vida financeira sofre impacto imediato. Você depende diretamente da sua renda ativa e não tem proteção estruturada.",
      priority: "Você precisa priorizar proteção de renda e cobertura para afastamento.",
      min: 13,
      max: 17,
      tone: "high",
      items: [
        "Coberturas de Atestado (doença e acidente)",
        "Coberturas de Renda hospitalar",
        "Garantia Educacional / morte (caso tenha filhos)",
        "Doenças Graves",
        "Cirurgia / Fratura",
        "Invalidez",
      ],
    };
  }
  if (score >= 8) {
    return {
      label: "Perfil médio risco",
      title: "Sua proteção tem pontos frágeis",
      text: "Existe algum controle, mas parte importante da sua renda, reserva ou família ainda pode ficar descoberta em caso de afastamento, doença grave ou invalidez.",
      priority: "Você precisa revisar capital segurado, coberturas em vida e proteção de renda.",
      min: 8,
      max: 12,
      tone: "medium",
      items: [
        "Revisão da apólice atual",
        "Doenças Graves",
        "Proteção de renda",
        "Invalidez",
        "Capital sob medida para família",
      ],
    };
  }
  return {
    label: "Perfil baixo risco",
    title: "Seu cenário parece mais controlado",
    text: "Você demonstra mais margem de segurança, mas ainda vale confirmar se a proteção acompanha sua renda, patrimônio e objetivos de vida.",
    priority: "Você precisa validar se o plano atual continua adequado ao seu momento.",
    min: 0,
    max: 7,
    tone: "low",
    items: [
      "Revisão preventiva",
      "Comparativo de coberturas",
      "Doenças Graves",
      "Planejamento sucessório",
    ],
  };
};

const buildMessage = () => {
  const risk = getRisk();
  const answers = state.answers.map((answer, index) => `${index + 1}. ${questions[index].title}: ${answer.value}`);
  return [
    `Olá Lucas, terminei o diagnóstico e meu perfil é ${risk.label}.`,
    "",
    `Nome: ${state.lead.name || "Não informado"}`,
    `Email: ${state.lead.email || "Não informado"}`,
    `WhatsApp: ${state.lead.phone || "Não informado"}`,
    "",
    `Pontuação: ${getScore()}/17`,
    risk.title,
    "",
    "Respostas:",
    ...answers,
    "",
    "Quero entender as coberturas recomendadas.",
  ].join("\n");
};

const buildCalendlyUrl = () => {
  const url = new URL(CALENDLY_URL);
  if (state.lead.name) url.searchParams.set("name", state.lead.name);
  if (state.lead.email) url.searchParams.set("email", state.lead.email);
  url.searchParams.set("hide_event_type_details", "1");
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("background_color", "ffffff");
  url.searchParams.set("text_color", "061d33");
  url.searchParams.set("primary_color", "1768a8");
  url.searchParams.set("utm_source", "diagnostico-lm");
  return url.toString();
};

const renderCalendly = () => {
  if (!schedulerSectionEl || !calendlyEmbedEl) return;

  const frame = document.createElement("iframe");
  frame.className = "calendly-frame";
  frame.title = "Agenda para apresentação do plano";
  frame.src = buildCalendlyUrl();
  frame.loading = "lazy";

  calendlyEmbedEl.replaceChildren(frame);
  schedulerSectionEl.hidden = false;
  schedulerSectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
};

const updateProgress = () => {
  const isLeadStep = state.step >= questions.length;
  progressRow.hidden = false;
  progressText.textContent = isLeadStep ? "Último passo" : `${padStep(state.step)} / 07`;
  progressBar.style.width = `${Math.min(((state.step + 1) / totalSteps) * 100, 100)}%`;
  backButton.hidden = state.step === 0 || isLeadStep;
};

const renderQuestion = () => {
  const question = questions[state.step];
  updateProgress();

  questionCard.innerHTML = `
    <h1 id="diagnostic-title">${question.title}</h1>
    ${question.note ? `<p class="question-note">${question.note}</p>` : ""}
    <div class="option-list">
      ${question.options
        .map(
          (option, index) => `
            <button type="button" class="option-button" data-option="${index}">
              <span>${option.label}</span>
              <b aria-hidden="true"></b>
            </button>
          `
        )
        .join("")}
    </div>
  `;

  questionCard.querySelectorAll(".option-button").forEach((button) => {
    button.addEventListener("click", () => {
      const option = question.options[Number(button.dataset.option)];
      state.answers[state.step] = option;
      button.classList.add("is-selected");
      window.setTimeout(() => {
        state.step += 1;
        if (state.step >= questions.length) {
          renderLeadForm();
          return;
        }
        renderQuestion();
        document.querySelector("#diagnostic-app")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 170);
    });
  });
};

const renderLeadForm = () => {
  updateProgress();
  backButton.hidden = true;
  questionCard.innerHTML = `
    <form class="lead-form" id="leadForm">
      <p class="form-kicker">Último passo</p>
      <h1>Para onde enviamos sua análise?</h1>
      <p class="question-note">Resposta imediata. Sem ligação.</p>

      <label>
        Nome
        <input name="name" autocomplete="name" placeholder="Como posso te chamar?" />
      </label>
      <label>
        Email
        <input name="email" type="email" autocomplete="email" placeholder="voce@exemplo.com" />
      </label>
      <label>
        WhatsApp
        <input name="phone" inputmode="tel" autocomplete="tel" placeholder="(xx) xxxxx-xxxx" />
      </label>
      <label class="consent-row">
        <input name="consent" type="checkbox" />
        <span>Concordo em receber minha análise no email e no WhatsApp. Leia a <a href="../privacidade.html">política de privacidade</a>.</span>
      </label>
      <button class="button button--primary" type="submit">Ver minha análise</button>
      <small>Seus dados são usados apenas para enviar sua análise personalizada. Sem spam. Nunca compartilhados.</small>
    </form>
  `;

  document.querySelector("#leadForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.lead = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      consent: data.get("consent") === "on",
    };
    renderResult();
  });

  document.querySelector("#diagnostic-app")?.scrollIntoView({ behavior: "smooth", block: "center" });
};

const renderResult = () => {
  const score = getScore();
  const risk = getRisk();
  progressRow.hidden = true;
  backButton.hidden = true;

  questionCard.innerHTML = `
    <article class="result-report result-report--${risk.tone}">
      <div class="success-mark" aria-hidden="true">✓</div>
      <p class="risk-pill">⚠ ${risk.label}</p>
      <h1>${risk.title}</h1>
      <p class="result-lead">${risk.text}</p>
      <p class="result-priority">${risk.priority}</p>

      <section class="score-card" aria-label="Pontuação de risco">
        <strong>${score}<span>/17</span></strong>
        <div class="score-labels"><span>Baixo</span><span>Médio</span><span>Alto</span></div>
        <div class="score-track"><i style="width: ${(score / 17) * 100}%"></i></div>
        <p>Sua faixa: ${risk.min}–${risk.max} pontos · Classificação ${risk.label.toLowerCase()}</p>
      </section>

      <section class="report-section">
        <p class="eyebrow">Indicação de coberturas</p>
        <div class="info-card">
          <p>Para clientes de ${risk.label.replace("Perfil ", "").toUpperCase()} como você o foco precisa ser em coberturas que vão garantir sua receita caso não possa trabalhar, seja por doença, cirurgia ou afastamento por atestado. Além de garantir a renda precisamos pensar também em cenários que afetem sua reserva, seu patrimônio e seus dependentes (caso tenha).</p>
          <p>O que vai fazer sua proteção ser adequada é calcular exatamente o impacto financeiro dos acontecimentos e estipular valores que sustentem isso ou gerem uma renda passiva para garantir seu padrão de vida.</p>
          <p>Então nossa indicação é em coberturas que visam garantir sua renda, que te proteja em vida e que garantam financeiramente quem fica:</p>
          <ul class="check-list">
            ${risk.items.map((item) => `<li>${item}</li>`).join("")}
          </ul>
          <strong class="alert-line">No seu caso específico um levantamento em mais de uma seguradora é obrigatório!</strong>
        </div>
      </section>

      <section class="report-section">
        <p class="eyebrow">O que isso significa</p>
        <div class="meaning-grid">
          <article class="info-card">
            <span class="icon-circle">↘</span>
            <h2>O custo real de ficar exposto</h2>
            <p>Cada mês sem proteção é um mês em que sua renda, sua reserva e seu patrimônio carregam um risco que você não calculou. Quando o evento acontece, o impacto financeiro real costuma ser muito maior do que o valor de qualquer apólice mensal.</p>
          </article>
          <article class="info-card">
            <span class="icon-circle">♡</span>
            <h2>A doença muda o custo de viver</h2>
            <p>Quando uma doença grave chega, tudo muda. Não é só a renda que pode diminuir, as despesas aumentam rapidamente. Novos tratamentos, médicos que não aceitam plano de saúde, medicamentos, cuidados extras e necessidades inesperadas passam a fazer parte da rotina.</p>
          </article>
          <article class="info-card">
            <span class="icon-circle">♡</span>
            <h2>Quanto</h2>
            <p>Não trabalhamos com valor de prateleira. O custo é resultado direto do que o diagnóstico aponta como prioritário pra você. Levantamos opções em mais de uma seguradora e mostramos o que cada conjunto de coberturas representa por mês, sem compromisso.</p>
          </article>
          <article class="info-card">
            <span class="icon-circle">♢</span>
            <h2>Por que pagamento de benefícios são negados</h2>
            <p>Sinistro recusado quase sempre vem antes do sinistro: na hora do preenchimento. Apólice montada de forma genérica, declaração de saúde sem detalhamento real e coberturas mal alinhadas ao perfil são as causas mais comuns de negativa.</p>
          </article>
        </div>
      </section>

      <section class="report-section">
        <p class="eyebrow">Próximos passos</p>
        <ol class="steps-list">
          <li><strong>01</strong><span><b>Fale com especialista</b>Resposta em poucos minutos, direto pelo WhatsApp. Sem call center.</span></li>
          <li><strong>02</strong><span><b>Receba proposta sob medida</b>Plano montado com base no diagnóstico, comparando as melhores seguradoras.</span></li>
          <li><strong>03</strong><span><b>Contrate quando fizer sentido</b>Zero pressão. Você decide o timing, assina online, começa a cobertura.</span></li>
        </ol>
      </section>

      <section class="final-cta-card">
        <div class="avatar" aria-hidden="true">L</div>
        <h2>${state.lead.name || "Agora"}, vamos transformar esse diagnóstico em proteção?</h2>
        <p>Atendimento com especialista. Sem bot, sem call center, sem empurrada de produto.</p>
        <a class="button button--primary" target="_blank" rel="noreferrer" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}">Falar com especialista →</a>
        <a class="button button--secondary" href="#agenda" data-open-scheduler>Quero fazer meu plano sozinho</a>
        <small>Feito por especialista, sem solução genérica.</small>
      </section>
    </article>
  `;

  document.querySelector("#diagnostic-app")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

backButton.addEventListener("click", () => {
  state.answers.splice(Math.max(0, state.step - 1), 1);
  state.step = Math.max(0, state.step - 1);
  renderQuestion();
});

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;

  if (link.matches("[data-open-scheduler]")) {
    event.preventDefault();
    renderCalendly();
    return;
  }

  const target = document.querySelector(link.getAttribute("href"));
  if (!target) return;

  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
});

renderQuestion();
