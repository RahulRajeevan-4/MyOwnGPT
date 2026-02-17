## Local Voice Assistant with Ollama (dolphin-llama3)

A React-based voice assistant UI that runs on your MacBook using local Ollama APIs.

### Features
- Start/Stop voice button (microphone is only active after Start to reduce battery drain).
- Streaming responses from Ollama.
- Strong system prompt to force detailed answers (not one-liners).
- Full conversation memory across turns.
- Barge-in support: if you talk while the assistant is speaking, speech output stops and your new question is handled.
- Assistant speaks answers back to you and also keeps the full transcript in the UI.
- Optional web search augmentation via a checkbox.

### Why you saw `405 Method Not Allowed` on `127.0.0.1:5500/api/ai/chat-stream`
That URL is usually your static Live Server and does not expose Express POST API routes. The app now auto-defaults API to `http://<your-host>:3000/api/ai/chat-stream` when not served from port 3000.

### Prerequisites
1. Install Ollama on macOS (e.g. with Homebrew).
2. Pull the model:
   ```bash
   ollama pull dolphin-llama3
   ```
3. Start Ollama:
   ```bash
   ollama serve
   ```

### Run
```bash
npm install
npm start
```

Open:
- `http://localhost:3000`

### Notes
- Uses browser Web Speech APIs (`SpeechRecognition`/`webkitSpeechRecognition` and `speechSynthesis`).
- Best in Chrome/Edge on macOS.
- Web search is optional and can be toggled in UI.
