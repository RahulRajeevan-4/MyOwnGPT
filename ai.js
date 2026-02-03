// server/routes/ai.js
import express from "express";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { messages, model = "dolphin-llama3" } = req.body;

    // Basic validation
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    const ollamaRes = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      return res.status(ollamaRes.status).json({ error: errText });
    }

    const data = await ollamaRes.json();

    // data.message.content contains the reply
    return res.json({
      reply: data?.message?.content ?? "",
      raw: data,
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// ✅ NEW: streaming endpoint (SSE)
router.post("/chat-stream", async (req, res) => {
  try {
    const { messages, model = "dolphin-llama3" } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    // If behind proxies, helps flush quickly
    res.flushHeaders?.();

    const ollamaRes = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
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

      // Ollama sends JSON objects separated by newlines
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // keep incomplete tail

      for (const line of lines) {
        if (!line.trim()) continue;

        // forward raw json line as SSE data
        res.write(`data: ${line}\n\n`);
      }
    }

    // send any remaining buffered line
    if (buffer.trim()) {
      res.write(`data: ${buffer}\n\n`);
    }

    res.write(`event: end\ndata: {}\n\n`);
    res.end();
  } catch (e) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: e?.message || "Server error" })}\n\n`);
    res.end();
  }
});

export default router;
