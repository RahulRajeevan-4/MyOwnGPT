## Local Voice Assistant with Ollama (dolphin-llama3 + qwen3-tts)

A React-based voice assistant UI that runs on your MacBook using local Ollama APIs.

### Features
- Start/Stop voice button (microphone is only active after Start to reduce battery drain).
- Streaming responses from Ollama chat model.
- Strong system prompt to force detailed answers (not one-liners).
- Full conversation memory across turns.
- Barge-in support: if you talk while assistant is speaking, current playback/response is interrupted.
- Qwen3-TTS voice playback path for assistant answers.
- Mic gating so recognition pauses while assistant audio is playing to avoid feedback loops.
- Optional web search augmentation via a checkbox.

### Why you saw `405 Method Not Allowed` on `127.0.0.1:5500/api/ai/chat-stream`
That URL is usually your static Live Server and does not expose Express POST API routes. The app auto-defaults API to `http://<your-host>:3000/api/ai/chat-stream` when not served from port 3000.

### Prerequisites
1. Install Ollama on macOS (e.g. with Homebrew).
2. Pull models:
   ```bash
   ollama pull dolphin-llama3
   ollama pull qwen3-tts
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
- Uses browser Web Speech APIs (`SpeechRecognition`/`webkitSpeechRecognition`) for microphone recognition.
- For voice playback, app tries `/api/ai/tts` with `qwen3-tts`, and falls back to browser TTS only if local TTS audio is not returned by model/runtime.
- Best in Chrome/Edge on macOS.
