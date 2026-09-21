"use strict";

const fs = require("node:fs");
const path = require("node:path");

const source = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "events.json");

let events;
try {
  events = JSON.parse(fs.readFileSync(source, "utf8"));
} catch (error) {
  console.error(`Не удалось прочитать события: ${error.message}`);
  process.exitCode = 1;
  return;
}

if (!Array.isArray(events)) {
  console.error("Ожидается JSON-массив событий.");
  process.exitCode = 1;
  return;
}

const criticalEvents = events.filter((event) => event.level === "critical");

criticalEvents.forEach((event) => {
  console.log(`${event.event} (${event.level})`);
});

console.log(`критичных ${criticalEvents.length}`);
