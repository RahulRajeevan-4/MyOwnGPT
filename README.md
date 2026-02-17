## Local Voice Assistant with Ollama (dolphin-llama3)

A simple React-based voice assistant UI that runs on your MacBook using local Ollama APIs.

### Features
- Start/Stop voice button (microphone is only active after Start to reduce battery drain).
- Streaming responses from Ollama.
- Detailed-answer system prompt (avoids short one-liners).
- Full conversation memory across turns.
- Barge-in support: if you talk while assistant is speaking, speech stops and it listens to your new request.
- Optional web search augmentation (DuckDuckGo instant answer API) via checkbox.

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
