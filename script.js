const messagesEl = document.querySelector("#agentMessages");
const controlsEl = document.querySelector("#agentControls");
const schedulerSectionEl = document.querySelector("#agenda");
const calendlyEmbedEl = document.querySelector("#calendlyEmbed");

const state = {
  step: 0,
  answers: {},
};

const LEAD_ENDPOINT = window.LM_LEAD_ENDPOINT || "";
const CALENDLY_URL = window.LM_CALENDLY_URL || "";
const WHATSAPP_NUMBER = "5519982404418";

const questions = [
  {
    key: "name",
    type: "text",
    question: "Olá, eu sou o consultor virtual da LM. Para começar, qual é o seu nome?",
    placeholder: "Seu nome completo",
    validate: (value) => value.trim().length >= 3,
    error: "Digite seu nome para eu seguir com a avaliação.",
  },
  {
    key: "phone",
    type: "phone",
    question: "Perfeito. Qual é o seu WhatsApp para um especialista te atender?",
    placeholder: "(00) 00000-0000",
    validate: (value) => value.replace(/\D/g, "").length === 11,
    error: "Informe um WhatsApp válido com DDD e 9 dígitos. Exemplo: (11) 94444-4444.",
  },
  {
    key: "email",
    type: "email",
    question: "E qual é o seu e-mail?",
    placeholder: "seuemail@exemplo.com",
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    error: "Informe um e-mail válido para eu seguir com a avaliação.",
  },
  {
    key: "birthDate",
    type: "date",
    question: "Qual é a sua data de nascimento?",
    placeholder: "dd/mm/aaaa",
    validate: (value) => {
      const age = calculateAge(value);
      return Number.isInteger(age) && age >= 18 && age <= 85;
    },
    error: "Informe uma data de nascimento válida para idade entre 18 e 85 anos.",
  },
  {
    key: "smoker",
    type: "choice",
    question: "Você fuma ou usa algum produto com nicotina?",
    options: [
      { label: "Não", value: "Não fuma", score: 0 },
      { label: "Sim", value: "Fuma ou usa nicotina", score: 0 },
      { label: "Parei de fumar", value: "Ex-fumante", score: 0 },
    ],
  },
  {
    key: "ridesMotorcycle",
    type: "choice",
    question: "Você anda de moto?",
    options: [
      { label: "Não", value: "Não anda de moto", score: 0 },
      { label: "Sim, às vezes", value: "Anda de moto ocasionalmente", score: 0 },
      { label: "Sim, com frequência", value: "Anda de moto com frequência", score: 0 },
    ],
  },
  {
    key: "height",
    type: "number",
    question: "Qual é a sua altura em centímetros?",
    placeholder: "Ex.: 175",
    validate: (value) => {
      const height = Number(value);
      return Number.isInteger(height) && height >= 120 && height <= 230;
    },
    error: "Informe sua altura em centímetros. Exemplo: 175.",
  },
  {
    key: "weight",
    type: "number",
    question: "Qual é o seu peso em quilos?",
    placeholder: "Ex.: 82",
    validate: (value) => {
      const weight = Number(value);
      return weight >= 35 && weight <= 250;
    },
    error: "Informe seu peso em quilos. Exemplo: 82.",
  },
  {
    key: "monthlyIncome",
    type: "currency",
    question: "Qual é a sua renda mensal declarada?",
    placeholder: "Ex.: R$ 8.000",
    validate: (value) => Number(value.replace(/\D/g, "")) > 0,
    error: "Informe uma renda mensal declarada válida.",
  },
  {
    key: "profession",
    type: "text",
    question: "Qual é a sua profissão ou atividade principal exercida no dia a dia?",
    placeholder: "Ex.: médico, advogado, motorista, gerente comercial",
    validate: (value) => value.trim().length >= 3,
    error: "Informe sua profissão ou atividade principal.",
  },
  {
    key: "dependents",
    type: "choice",
    question: "Hoje alguém depende financeiramente de você?",
    options: [
      { label: "Sim, minha família depende", value: "Sim, minha família depende", score: 3 },
      { label: "Parcialmente", value: "Parcialmente", score: 2 },
      { label: "Não no momento", value: "Não no momento", score: 0 },
    ],
  },
  {
    key: "goal",
    type: "choice",
    question: "Qual é o principal motivo para pensar em seguro de vida agora?",
    options: [
      { label: "Proteger minha família", value: "Proteger minha família", score: 3 },
      { label: "Organizar meu planejamento financeiro", value: "Planejamento financeiro", score: 2 },
      { label: "Proteger sócios ou empresa", value: "Proteção para sócios ou empresa", score: 3 },
      { label: "Revisar uma apólice que já tenho", value: "Revisar apólice existente", score: 2 },
    ],
  },
  {
    key: "insurance",
    type: "choice",
    question: "Você já tem algum seguro de vida hoje?",
    options: [
      { label: "Não tenho", value: "Não tenho seguro de vida", score: 2 },
      { label: "Tenho, mas não sei se está adequado", value: "Tem seguro, mas quer revisar", score: 2 },
      { label: "Tenho e está tudo certo", value: "Tem seguro e acredita estar adequado", score: 0 },
    ],
  },
  {
    key: "timing",
    type: "choice",
    skip: () => Boolean(CALENDLY_URL),
    question: "Quando você gostaria de receber uma orientação ou orçamento?",
    options: [
      { label: "Ainda hoje", value: "Ainda hoje", score: 3 },
      { label: "Nesta semana", value: "Nesta semana", score: 2 },
      { label: "Só estou pesquisando", value: "Só está pesquisando", score: 0 },
    ],
  },
  {
    key: "bestTime",
    type: "choice",
    skip: () => Boolean(CALENDLY_URL),
    question: "Qual período costuma funcionar melhor para receber a apresentação do diagnóstico?",
    options: [
      { label: "Manhã", value: "Manhã", score: 0 },
      { label: "Tarde", value: "Tarde", score: 0 },
      { label: "Noite", value: "Noite", score: 0 },
      { label: "Horário comercial", value: "Horário comercial", score: 0 },
    ],
  },
];

const parseBirthDate = (value) => {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    return date;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    return date;
  }

  return null;
};

const calculateAge = (birthDateValue) => {
  const birthDate = parseBirthDate(birthDateValue);
  if (!birthDate || Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
};

const formatBirthDate = (value) => {
  const birthDate = parseBirthDate(value);
  if (!birthDate || Number.isNaN(birthDate.getTime())) return value;

  const day = String(birthDate.getDate()).padStart(2, "0");
  const month = String(birthDate.getMonth() + 1).padStart(2, "0");
  const year = birthDate.getFullYear();
  return `${day}/${month}/${year}`;
};

const phoneMask = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const birthDateMask = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const moneyMask = (value) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  const amount = Number(digits);
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
};

const formatAnswer = (question, value) => {
  if (question.type === "phone") return phoneMask(value);
  if (question.type === "date") return formatBirthDate(value);
  if (question.type === "currency") return moneyMask(value);
  return value;
};

const scrollMessages = () => {
  messagesEl.scrollTop = messagesEl.scrollHeight;
};

const addMessage = (text, role = "bot") => {
  const message = document.createElement("div");
  message.className = `agent__message agent__message--${role}`;
  message.innerHTML = text;
  messagesEl.appendChild(message);
  scrollMessages();
};

const showTyping = () => {
  const typing = document.createElement("div");
  typing.className = "agent__typing";
  typing.innerHTML = "<span></span><span></span><span></span>";
  messagesEl.appendChild(typing);
  scrollMessages();
  return typing;
};

const botSay = (text, delay = 320) => {
  const typing = showTyping();
  window.setTimeout(() => {
    typing.remove();
    addMessage(text, "bot");
  }, delay);
};

const clearControls = () => {
  controlsEl.innerHTML = "";
};

const scoreLead = () => {
  const total = questions.reduce((score, question) => {
    const answer = state.answers[question.key];
    if (!question.options || !answer) return score;
    const option = question.options.find((item) => item.value === answer);
    return score + (option?.score || 0);
  }, 0);

  if (total >= 10) {
    return {
      label: "Lead quente",
      score: total,
      summary: "perfil com prioridade alta para análise e contato rápido.",
    };
  }

  if (total >= 6) {
    return {
      label: "Lead morno",
      score: total,
      summary: "perfil com interesse real, bom para abordagem consultiva.",
    };
  }

  return {
    label: "Lead inicial",
    score: total,
    summary: "perfil em fase de pesquisa, precisa de educação e orientação.",
  };
};

const buildWhatsappMessage = () => {
  const payload = buildLeadPayload();

  return [
    "Olá, gostaria de receber uma avaliação de seguro de vida.",
    "",
    `Nome: ${payload.answers.name}`,
    `WhatsApp: ${payload.answers.phone}`,
    `E-mail: ${payload.answers.email}`,
    `Data de nascimento: ${payload.answers.birthDate}`,
    `Idade calculada: ${payload.answers.age}`,
    `Fuma: ${payload.answers.smoker}`,
    `Anda de moto: ${payload.answers.ridesMotorcycle}`,
    `Altura: ${payload.answers.height} cm`,
    `Peso: ${payload.answers.weight} kg`,
    `Renda mensal declarada: ${payload.answers.monthlyIncome}`,
    `Profissão: ${payload.answers.profession}`,
    `Dependentes: ${payload.answers.dependents}`,
    `Objetivo: ${payload.answers.goal}`,
    `Seguro atual: ${payload.answers.insurance}`,
    `Agendamento: ${payload.answers.timing}`,
    `Agenda: ${payload.answers.schedule}`,
    `Preferência de horário: ${payload.answers.bestTime}`,
  ].join("\n");
};

const buildLeadPayload = () => {
  const lead = scoreLead();
  const answers = state.answers;

  return {
    source: "lp-seguro-de-vida",
    createdAt: new Date().toISOString(),
    lead: {
      label: lead.label,
      score: lead.score,
      summary: lead.summary,
    },
    answers: {
      name: answers.name,
      phone: answers.phone,
      email: answers.email,
      birthDate: answers.birthDate,
      age: calculateAge(answers.birthDate),
      smoker: answers.smoker,
      ridesMotorcycle: answers.ridesMotorcycle,
      height: answers.height,
      weight: answers.weight,
      monthlyIncome: answers.monthlyIncome,
      profession: answers.profession,
      dependents: answers.dependents,
      goal: answers.goal,
      insurance: answers.insurance,
      timing: answers.timing || "Cliente deve escolher horario no Calendly",
      schedule: CALENDLY_URL ? "Cliente deve escolher horario no Calendly" : "Sem Calendly configurado",
      bestTime: answers.bestTime || "A escolher na agenda",
    },
  };
};

const buildCalendlyUrl = () => {
  const url = new URL(CALENDLY_URL);
  url.searchParams.set("name", state.answers.name);
  url.searchParams.set("email", state.answers.email);
  url.searchParams.set("hide_event_type_details", "1");
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("background_color", "ffffff");
  url.searchParams.set("text_color", "061d33");
  url.searchParams.set("primary_color", "1768a8");
  url.searchParams.set("utm_source", "lp-seguro-de-vida");
  return url.toString();
};

const sendLeadToEndpoint = async () => {
  if (!LEAD_ENDPOINT) {
    return;
  }

  const response = await fetch(LEAD_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildLeadPayload()),
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel enviar seus dados agora.");
  }
};

const openWhatsapp = () => {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsappMessage())}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
};

const renderCalendly = () => {
  if (!schedulerSectionEl || !calendlyEmbedEl) return;

  const frame = document.createElement("iframe");
  frame.className = "calendly-frame";
  frame.title = "Agenda para apresentação do diagnóstico";
  frame.src = buildCalendlyUrl();
  frame.loading = "lazy";
  frame.style.width = "100%";
  frame.style.minWidth = "100%";
  frame.style.height = window.matchMedia("(max-width: 680px)").matches ? "700px" : "760px";
  frame.style.minHeight = frame.style.height;
  frame.style.border = "0";

  calendlyEmbedEl.replaceChildren(frame);
  schedulerSectionEl.hidden = false;
  schedulerSectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
};

const createActionButton = (label, className = "button button--submit") => {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.textContent = label;
  return button;
};

const finishAgent = () => {
  botSay(
    `Pronto, <strong>${state.answers.name}</strong>. Recebi suas respostas e organizei as principais informações para o atendimento.`,
    260
  );

  window.setTimeout(() => {
    const nextStepText = CALENDLY_URL
      ? "Agora você pode escolher um horário para a apresentação do seu diagnóstico e da solução mais adequada para o seu momento."
      : "Um especialista vai analisar seu caso e falar com você pelo WhatsApp informado. Assim o atendimento já começa mais objetivo e pessoal.";

    botSay(nextStepText, 260);

    clearControls();

    if (CALENDLY_URL) {
      const scheduleButton = createActionButton("Escolher horário na agenda");
      const whatsappButton = createActionButton("Prefiro contato pelo WhatsApp", "button action-secondary");

      scheduleButton.addEventListener("click", async () => {
        scheduleButton.disabled = true;
        scheduleButton.textContent = "Carregando agenda...";

        try {
          await sendLeadToEndpoint();
          renderCalendly();
          scheduleButton.textContent = "Agenda aberta abaixo";
        } catch (error) {
          scheduleButton.disabled = false;
          scheduleButton.textContent = "Tentar abrir a agenda novamente";
          botSay("Não consegui carregar a agenda agora. Por favor, tente novamente em alguns instantes.", 260);
        }
      });

      whatsappButton.addEventListener("click", async () => {
        whatsappButton.disabled = true;
        whatsappButton.textContent = "Enviando...";

        try {
          await sendLeadToEndpoint();
          openWhatsapp();
          whatsappButton.textContent = "Abrindo WhatsApp...";
        } catch (error) {
          whatsappButton.disabled = false;
          whatsappButton.textContent = "Tentar novamente";
          botSay("Não consegui enviar agora. Por favor, tente novamente em alguns instantes.", 260);
        }
      });

      controlsEl.append(scheduleButton, whatsappButton);
      return;
    }

    const button = createActionButton("Solicitar contato do especialista");
    button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "Enviando...";

      try {
        await sendLeadToEndpoint();
        if (!LEAD_ENDPOINT) {
          openWhatsapp();
        }
        button.textContent = LEAD_ENDPOINT ? "Solicitação enviada" : "Abrindo WhatsApp...";
      } catch (error) {
        button.disabled = false;
        button.textContent = "Tentar novamente";
        botSay("Não consegui enviar agora. Por favor, tente novamente em alguns instantes.", 260);
      }
    });
    controlsEl.appendChild(button);
  }, 850);
};

const nextQuestion = () => {
  clearControls();

  while (state.step < questions.length && questions[state.step].skip?.()) {
    state.step += 1;
  }

  if (state.step >= questions.length) {
    finishAgent();
    return;
  }

  const question = questions[state.step];
  botSay(question.question);

  window.setTimeout(() => {
    if (question.type === "choice") {
      const list = document.createElement("div");
      list.className = "agent__options";

      question.options.forEach((option) => {
        const button = document.createElement("button");
        button.className = "agent__option";
        button.type = "button";
        button.textContent = option.label;
        button.addEventListener("click", () => {
          state.answers[question.key] = option.value;
          addMessage(option.label, "user");
          state.step += 1;
          nextQuestion();
        });
        list.appendChild(button);
      });

      controlsEl.appendChild(list);
      return;
    }

    const row = document.createElement("div");
    row.className = "agent__input-row";

    const input = document.createElement("input");
    input.className = "agent__input";
    input.placeholder = question.placeholder;
    input.autocomplete =
      question.key === "name"
        ? "name"
        : question.key === "phone"
          ? "tel"
          : question.key === "email"
            ? "email"
            : question.key === "birthDate"
              ? "bday"
              : "off";
    input.inputMode =
      question.type === "number" || question.type === "phone" || question.type === "currency" || question.type === "date"
        ? "numeric"
        : "text";
    input.type = question.type === "number" ? "number" : question.type === "email" ? "email" : "text";

    const button = document.createElement("button");
    button.className = "agent__send";
    button.type = "button";
    button.textContent = "Enviar";

    const submit = () => {
      const value = input.value.trim();
      if (!question.validate(value)) {
        input.setCustomValidity(question.error);
        input.reportValidity();
        input.setCustomValidity("");
        return;
      }

      state.answers[question.key] = formatAnswer(question, value);
      addMessage(state.answers[question.key], "user");
      state.step += 1;
      nextQuestion();
    };

    if (question.type === "phone") {
      input.addEventListener("input", () => {
        input.value = phoneMask(input.value);
      });
    }

    if (question.type === "date") {
      input.addEventListener("input", () => {
        input.value = birthDateMask(input.value);
      });
    }

    if (question.type === "currency") {
      input.addEventListener("input", () => {
        input.value = moneyMask(input.value);
      });
    }

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") submit();
    });

    button.addEventListener("click", submit);
    row.append(input, button);
    controlsEl.appendChild(row);
    input.focus();
  }, 420);
};

nextQuestion();
