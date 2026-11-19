// Asks every suggested question the customer app shows, on its own step.
// For each one: which knowledge entries were found, and the AI's answer.
// Needs Ollama (run inside the AI container).
const { handleMessage } = require("./src/router");
const { initializeKnowledge, retrieveKnowledge } = require("./src/retrieval");

// The same questions as the app's "ans.account.stepN" suggestions.
const tests = [
  { step: 1, question: "What did I do wrong?", lastError: "COUNTRY_NOT_SUPPORTED", expect: "error_country_not_supported" },
  { step: 1, question: "What can I do if my passport isn't on the list?", expect: "passport_not_supported" },
  { step: 2, question: "What is NFC?", expect: "nfc_explanation" },
  { step: 2, question: "How do I check if my phone has NFC?", expect: "nfc_compatibility" },
  { step: 3, question: "Why won't my passport scan?", expect: "scan_troubleshooting" },
  { step: 3, question: "Where is the chip on my passport?", expect: "passport_position" },
  { step: 3, question: "How do I know if my phone has NFC?", expect: "nfc_phone_check" },
  { step: 4, question: "Why couldn't it read my ID?", expect: null },
  { step: 4, question: "What happens with my face photo?", expect: "face_photo_privacy" },
  { step: 5, question: "Which documents are accepted?", expect: "accepted_documents" },
  { step: 5, question: "How long do I have to upload them?", expect: "document_timeframe" },
  { step: 5, question: "Why was my file rejected?", expect: null },
  { step: 6, question: "What happens after I submit?", expect: null },
  { step: 6, question: "How long until my account is ready?", expect: null },
];

async function main() {
  await initializeKnowledge();
  let answered = 0;
  let found = 0;
  let checked = 0;

  for (const t of tests) {
    const pageId = `account.step${t.step}`;
    const hits = await retrieveKnowledge(t.lastError ? `${t.question} ${t.lastError}` : t.question, pageId);
    const ids = hits.map((h) => h.id);
    const result = await handleMessage({ question: t.question, pageId, context: { lastError: t.lastError || null } });

    console.log("\n================================");
    console.log(`STEP ${t.step}: ${t.question}`);
    console.log("Knowledge found:", ids.join(", ") || "(none)");
    console.log("Answer:", result.answer);

    if (t.expect) {
      checked++;
      if (ids.includes(t.expect)) found++;
      else console.log(`NOTE: expected entry "${t.expect}" not in the top results`);
    }
    if (result.type === "ai_answer" && result.fallback === false && result.answer?.trim()) {
      answered++;
      console.log("RESULT: PASS");
    } else {
      console.log("RESULT: REVIEW NEEDED");
    }
  }

  console.log("\n================================");
  console.log(`Answered: ${answered}/${tests.length}`);
  console.log(`Expected knowledge found: ${found}/${checked}`);
}

main().catch((error) => console.error("Test error:", error.message));
