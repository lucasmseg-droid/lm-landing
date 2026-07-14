const heroScreen = document.querySelector("#heroScreen");
const quizScreen = document.querySelector("#quizScreen");
const startButton = document.querySelector("#startButton");
const progressLabel = document.querySelector("#progressLabel");
const progressPercent = document.querySelector("#progressPercent");
const progressBar = document.querySelector("#progressBar");
const questionPanel = document.querySelector("#questionPanel");

const WHATSAPP_NUMBER = "5545999127768";

const state = {
  step: 0,
  answers: [],
  lead: {
    name: "",
    phone: "",
    city: "",
  },
};

const questions = [
  {
    title: "Qual sua faixa etária?",
    options: [
      { icon: "👤", label: "18-30 anos", score: 1 },
      { icon: "👨‍👩‍👧", label: "31-45 anos", score: 2 },
      { icon: "🏠", label: "46-60 anos", score: 3 },
      { icon: "💼", label: "60+ anos", score: 3 },
    ],
  },
  {
    title: "Quantas pessoas dependem da sua renda?",
    options: [
      { icon: "👤", label: "Só eu", score: 1 },
      { icon: "👨‍👩‍👧", label: "1-2 pessoas", score: 2 },
      { icon: "🏠", label: "3-4 pessoas", score: 3 },
      { icon: "💼", label: "5 ou mais", score: 4 },
    ],
  },
  {
    title: "Você é o principal responsável financeiro da família?",
    options: [
      { icon: "👤", label: "Sim", score: 4 },
      { icon: "👨‍👩‍👧", label: "Parcialmente", score: 2 },
      { icon: "🏠", label: "Não", score: 1 },
    ],
  },
  {
    title: "Você já possui seguro de vida ou proteção de renda?",
    options: [
      { icon: "👤", label: "Sim, tenho e confio", score: 0 },
      { icon: "👨‍👩‍👧", label: "Tenho, mas não sei se está adequado", score: 2 },
      { icon: "🏠", label: "Não tenho", score: 4 },
      { icon: "💼", label: "Já tive", score: 3 },
    ],
  },
  {
    title: "O que mais te preocupa em relação ao futuro?",
    options: [
      { icon: "👤", label: "Deixar dívidas", score: 3 },
      { icon: "👨‍👩‍👧", label: "Família desamparada", score: 4 },
      { icon: "🏠", label: "Perder renda por doença", score: 4 },
      { icon: "💼", label: "Burocracia no sinistro", score: 2 },
    ],
  },
  {
    title: "Qual sua renda familiar mensal aproximada?",
    options: [
      { icon: "👤", label: "Até R$ 3 mil", score: 1 },
      { icon: "👨‍👩‍👧", label: "R$ 3 a 6 mil", score: 2 },
      { icon: "🏠", label: "R$ 6 a 10 mil", score: 3 },
      { icon: "💼", label: "Acima de R$ 10 mil", score: 4 },
    ],
  },
  {
    title: "Se sua renda parasse hoje, por quanto tempo sua reserva sustentaria a casa?",
    options: [
      { icon: "👤", label: "Não tenho reserva", score: 4 },
      { icon: "👨‍👩‍👧", label: "Até 3 meses", score: 3 },
      { icon: "🏠", label: "3 a 6 meses", score: 2 },
      { icon: "💼", label: "Mais de 6 meses", score: 0 },
    ],
  },
  {
    title: "Tem filhos menores de 18 anos?",
    options: [
      { icon: "👤", label: "Sim", score: 4 },
      { icon: "👨‍👩‍👧", label: "Não", score: 1 },
      { icon: "🏠", label: "Estou planejando", score: 2 },
    ],
  },
  {
    title: "Como conheceu a LM Gestão de Riscos?",
    options: [
      { icon: "👤", label: "Indicação", score: 1 },
      { icon: "👨‍👩‍👧", label: "Instagram", score: 1 },
      { icon: "🏠", label: "Google", score: 1 },
      { icon: "💼", label: "Outro", score: 1 },
    ],
  },
  {
    title: "Quando pretende organizar sua proteção?",
    subtitle: "Quanto antes sua análise for feita, mais previsível fica o plano.",
    options: [
      { icon: "🎉", label: "Imediatamente", score: 4 },
      { icon: "👨‍👩‍👧", label: "Este mês", score: 3 },
      { icon: "🏠", label: "Próximos 3 meses", score: 2 },
      { icon: "💼", label: "Apenas pesquisando", score: 1 },
    ],
  },
];

const totalScore = questions.reduce((sum, question) => {
  return sum + Math.max(...question.options.map((option) => option.score));
}, 0);

const getScore = () => state.answers.reduce((sum, answer) => sum + answer.score, 0);

const getResult = () => {
  const percent = Math.round((getScore() / totalScore) * 100);

  if (percent >= 72) {
    return {
      percent,
      title: "Proteção Urgente",
      copy:
        "Seu cenário mostra alta dependência da renda e pontos importantes sem proteção. O ideal é revisar capital segurado, coberturas em vida e proteção de renda com prioridade.",
    };
  }

  if (percent >= 42) {
    return {
      percent,
      title: "Proteção Adequada",
      copy:
        "Você está no caminho certo, mas existem pontos que precisam ser ajustados para evitar contratação genérica ou cobertura insuficiente.",
    };
  }

  return {
    percent,
    title: "Proteção Controlada",
    copy:
      "Seu cenário parece mais organizado. Ainda assim, vale validar se o plano acompanha sua renda, família, patrimônio e objetivos atuais.",
  };
};

const buildWhatsappMessage = () => {
  const result = getResult();
  const answers = state.answers.map((answer, index) => {
    return `${index + 1}. ${questions[index].title}: ${answer.label}`;
  });

  return [
    `Olá Lucas, terminei a avaliação gratuita da LM.`,
    "",
    `Nome: ${state.lead.name}`,
    `WhatsApp: ${state.lead.phone}`,
    `Cidade: ${state.lead.city}`,
    "",
    `Resultado: ${result.percent}% - ${result.title}`,
    "",
    "Respostas:",
    ...answers,
    "",
    "Quero receber minha análise personalizada.",
  ].join("\n");
};

const showQuiz = () => {
  heroScreen.hidden = true;
  heroScreen.classList.remove("is-active");
  quizScreen.hidden = false;
  quizScreen.classList.add("is-active");
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const updateProgress = () => {
  const step = Math.min(state.step + 1, questions.length);
  const percent = Math.round((step / questions.length) * 100);
  progressLabel.textContent = `Pergunta ${step} de ${questions.length}`;
  progressPercent.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
};

const renderQuestion = () => {
  const question = questions[state.step];
  updateProgress();

  questionPanel.innerHTML = `
    <h2 class="question-title">${question.title}</h2>
    ${question.subtitle ? `<p class="question-subtitle">${question.subtitle}</p>` : ""}
    <div class="option-list">
      ${question.options
        .map(
          (option, index) => `
            <button class="option-button" type="button" data-option="${index}">
              <span class="option-icon" aria-hidden="true">${option.icon}</span>
              <span>${option.label}</span>
            </button>
          `
        )
        .join("")}
    </div>
  `;

  questionPanel.querySelectorAll(".option-button").forEach((button) => {
    button.addEventListener("click", () => {
      const option = question.options[Number(button.dataset.option)];
      state.answers[state.step] = option;
      button.classList.add("is-selected");

      window.setTimeout(() => {
        state.step += 1;
        if (state.step >= questions.length) {
          renderLeadStep();
          return;
        }
        renderQuestion();
      }, 260);
    });
  });
};

const renderLeadStep = () => {
  const result = getResult();
  progressLabel.textContent = "Análise pronta";
  progressPercent.textContent = `${result.percent}%`;
  progressBar.style.width = `${result.percent}%`;

  questionPanel.innerHTML = `
    <section class="result-card">
      <div class="score-ring">${result.percent}%</div>
      <h1 class="result-title">${result.title}</h1>
      <p class="result-copy">${result.copy}</p>
    </section>

    <section class="lead-card">
      <div class="lead-icon" aria-hidden="true">📋</div>
      <h2>Receba Sua Análise Completa</h2>
      <p class="lead-copy">Preencha os dados abaixo e receba gratuitamente uma análise com os pontos de atenção para sua proteção familiar.</p>

      <form class="lead-form" id="leadForm" novalidate>
        <label>
          Nome
          <input name="name" autocomplete="name" placeholder="Seu nome completo" />
          <span class="field-error" data-error-for="name"></span>
        </label>
        <label>
          WhatsApp
          <input name="phone" inputmode="tel" autocomplete="tel" placeholder="(45) 99912-7768" />
          <span class="field-error" data-error-for="phone"></span>
        </label>
        <label>
          Cidade
          <input name="city" autocomplete="address-level2" placeholder="Sua cidade" />
          <span class="field-error" data-error-for="city"></span>
        </label>
        <button class="primary-button" type="submit">🎯 Receber Minha Análise Gratuita</button>
      </form>

      <div class="mini-promises">
        <span>🔒 Sem compromisso</span>
        <span>⚡ Resposta em poucos minutos</span>
      </div>
    </section>
  `;

  document.querySelector("#leadForm").addEventListener("submit", handleLeadSubmit);
};

const setError = (field, message) => {
  const error = document.querySelector(`[data-error-for="${field}"]`);
  if (error) error.textContent = message;
};

const onlyDigits = (value) => value.replace(/\D/g, "");

const validateLead = (lead) => {
  let valid = true;
  setError("name", "");
  setError("phone", "");
  setError("city", "");

  if (lead.name.length < 3) {
    setError("name", "Nome deve ter pelo menos 3 caracteres");
    valid = false;
  }

  if (onlyDigits(lead.phone).length < 10) {
    setError("phone", "WhatsApp inválido");
    valid = false;
  }

  if (lead.city.length < 2) {
    setError("city", "Cidade deve ter pelo menos 2 caracteres");
    valid = false;
  }

  return valid;
};

const handleLeadSubmit = (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const lead = {
    name: String(data.get("name") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    city: String(data.get("city") || "").trim(),
  };

  if (!validateLead(lead)) return;

  state.lead = lead;
  renderThanks();
};

const renderThanks = () => {
  const result = getResult();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsappMessage())}`;

  progressLabel.textContent = "Finalizado";
  progressPercent.textContent = "100%";
  progressBar.style.width = "100%";

  questionPanel.innerHTML = `
    <section class="thanks-card">
      <div class="score-ring">${result.percent}%</div>
      <h2>Pronto, ${state.lead.name.split(" ")[0]}.</h2>
      <p class="lead-copy">Sua avaliação indica: <strong>${result.title}</strong>. Agora é só enviar as respostas para o Lucas analisar e retornar com o próximo passo.</p>
      <a class="whatsapp-button" href="${url}" target="_blank" rel="noreferrer">Enviar para o WhatsApp</a>
      <button class="reset-button" type="button" id="resetButton">Refazer avaliação</button>
    </section>
  `;

  document.querySelector("#resetButton").addEventListener("click", () => {
    state.step = 0;
    state.answers = [];
    renderQuestion();
  });
};

startButton.addEventListener("click", showQuiz);
