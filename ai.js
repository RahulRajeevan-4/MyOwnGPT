import express from "express";

const router = express.Router();

const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";

async function getWebContext(query) {
  if (!query || typeof query !== "string") return "";

  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(ddgUrl);
    if (!response.ok) return "";

    const data = await response.json();
    const snippets = [];

    if (data.AbstractText) {
      snippets.push(`- ${data.AbstractText}`);
    }

    if (Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, 6)) {
        if (topic?.Text) snippets.push(`- ${topic.Text}`);
        if (Array.isArray(topic?.Topics)) {
          for (const nested of topic.Topics.slice(0, 3)) {
            if (nested?.Text) snippets.push(`- ${nested.Text}`);
          }
        }
        if (snippets.length >= 8) break;
      }
    }

    if (!snippets.length) return "";

    return [
      "Use these web findings if relevant. If uncertain, say so clearly.",
      ...snippets.slice(0, 8),
    ].join("\n");
  } catch {
    return "";
  }
}

async function buildMessages(messages, webSearch) {
  if (!webSearch) return messages;

  const lastUserMessage = [...messages]
    .reverse()
    .find((msg) => msg.role === "user" && typeof msg.content === "string");

  if (!lastUserMessage) return messages;

  const webContext = await getWebContext(lastUserMessage.content);
  if (!webContext) return messages;

  return [
    {
      role: "system",
      content: `Web context for the current user request:\n${webContext}`,
    },
    ...messages,
  ];
}

router.post("/chat", async (req, res) => {
  try {
    const { messages, model = "dolphin-llama3", webSearch = false } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    const finalMessages = await buildMessages(messages, webSearch);

    const ollamaRes = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: finalMessages, stream: false }),
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      return res.status(ollamaRes.status).json({ error: errText });
    }

    const data = await ollamaRes.json();

    return res.json({
      reply: data?.message?.content ?? "",
      raw: data,
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

router.post("/chat-stream", async (req, res) => {
  try {
    const { messages, model = "dolphin-llama3", webSearch = false } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    const finalMessages = await buildMessages(messages, webSearch);

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const ollamaRes = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: finalMessages, stream: true }),
    });

    if (!ollamaRes.ok || !ollamaRes.body) {
      const errText = await ollamaRes.text().catch(() => "Ollama error");
      res.write(`event: error\ndata: ${JSON.stringify({ error: errText })}\n\n`);
      return res.end();
    }

    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        res.write(`data: ${line}\n\n`);
      }
    }

    if (buffer.trim()) {
      res.write(`data: ${buffer}\n\n`);
    }

    res.write("event: end\ndata: {}\n\n");
    res.end();
  } catch (e) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: e?.message || "Server error" })}\n\n`);
    res.end();
  }
});

export default router;
