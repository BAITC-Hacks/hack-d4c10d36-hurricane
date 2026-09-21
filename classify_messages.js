"use strict";

const fs = require("node:fs");
const path = require("node:path");

const COMPLAINT_MARKERS = [
  "очеред",
  "холодн",
  "пропал",
  "не работает",
  "сломал",
  "ошибка",
  "проблем",
];

const INFO_MARKERS = [
  "как получить",
  "где",
  "справк",
  "подскажите",
  "можно ли",
];

function classifyMessage(message) {
  const normalized = message.toLocaleLowerCase("ru-RU");

  if (COMPLAINT_MARKERS.some((marker) => normalized.includes(marker))) {
    return "жалоба";
  }
  if (INFO_MARKERS.some((marker) => normalized.includes(marker))) {
    return "справка";
  }
  return "другое";
}

function draftReply(message, category) {
  const normalized = message.toLocaleLowerCase("ru-RU");

  if (normalized.includes("справк") && normalized.includes("уч")) {
    return (
      "Здравствуйте! Справку о месте учёбы можно запросить в учебном " +
      "офисе или деканате. Укажите, пожалуйста, ФИО и нужный формат " +
      "справки, чтобы мы подсказали дальнейшие шаги."
    );
  }
  if (normalized.includes("столов")) {
    return (
      "Здравствуйте! Спасибо за сообщение. Передадим информацию о " +
      "длинной очереди и температуре еды ответственным за столовую. " +
      "Уточните, пожалуйста, дату и примерное время посещения."
    );
  }
  if (normalized.includes("консультац")) {
    return (
      "Здравствуйте! Поможем записаться на консультацию завтра. " +
      "Укажите, пожалуйста, тему обращения и удобное время."
    );
  }
  if (
    normalized.includes("wi-fi") ||
    normalized.includes("wifi") ||
    normalized.includes("вай-фай")
  ) {
    return (
      "Здравствуйте! Спасибо, зафиксировали проблему с Wi-Fi в корпусе B. " +
      "Передадим обращение технической службе; уточните, пожалуйста, " +
      "этаж и примерное время отключения."
    );
  }
  if (normalized.includes("парков")) {
    return (
      "Здравствуйте! Подскажите, пожалуйста, к какому корпусу вы " +
      "направляетесь, и мы пришлём схему гостевой парковки и въезда."
    );
  }

  if (category === "жалоба") {
    return (
      "Здравствуйте! Спасибо за обращение. Мы зафиксировали проблему " +
      "и передадим её ответственному подразделению."
    );
  }
  if (category === "справка") {
    return (
      "Здравствуйте! Спасибо за вопрос. Уточните, пожалуйста, детали, " +
      "чтобы мы могли предоставить точную информацию."
    );
  }
  return (
    "Здравствуйте! Спасибо за обращение. Уточните, пожалуйста, детали, " +
    "и мы направим запрос подходящему специалисту."
  );
}

function readMessages(filePath) {
  const contents = fs.readFileSync(filePath, "utf8");
  return contents
    .split(/\r?\n/u)
    .map((line) => line.replace(/^\s*\d+[.)]\s*/u, "").trim())
    .filter(Boolean);
}

function main() {
  const source = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(__dirname, "messages.txt");

  let messages;
  try {
    messages = readMessages(source);
  } catch (error) {
    console.error(`Ошибка чтения обращений: ${error.message}`);
    return 1;
  }

  if (messages.length === 0) {
    console.error("В файле нет обращений.");
    return 1;
  }

  messages.forEach((message, index) => {
    const category = classifyMessage(message);
    const reply = draftReply(message, category);

    console.log(`${index + 1}. ${message}`);
    console.log(`   Категория: ${category}`);
    console.log(`   Черновик ответа: ${reply}`);
    if (index < messages.length - 1) {
      console.log();
    }
  });

  return 0;
}

process.exitCode = main();
