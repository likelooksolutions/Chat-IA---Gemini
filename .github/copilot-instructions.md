# AI Agent Instructions for Gemini Chat Project

This document provides essential knowledge for AI coding agents to be immediately productive in this codebase.

## 1. Architecture Overview

This project consists of a single-page frontend application (`index.html`) and a lightweight Node.js backend server (`server.cjs`).

-   **Frontend (`index.html`)**: A self-contained HTML file that includes all CSS and JavaScript. It provides the user interface for chatting with the Gemini AI and an interactive terminal for executing local commands.
-   **Backend (`server.cjs`)**: A Node.js Express server responsible for securely executing shell commands requested by the frontend terminal.

## 2. Key Components & Data Flows

### 2.1 Frontend (`index.html`)

-   **Chat Interface**:
    -   Displays conversations (`#chat`).
    -   User input via `<textarea id="user-input">` and `<button id="send-btn">`.
    -   Conversations are stored in `localStorage` under the key `"conversations"`.
    -   AI responses are fetched from the Google Gemini API.
    -   Configuration (API key, model, persona) is managed via `#config-modal` and stored in `localStorage` under the key `"config"`.
    -   Markdown code blocks in AI responses are parsed and rendered with a "Copiar" button.
    -   HTML escaping is performed using the `escapeHtml` function for security.
-   **Interactive Terminal**:
    -   Triggered by `<button id="open-terminal">` and displayed in `#terminal-panel`.
    -   Commands are entered via `<input id="terminal-input">` and executed via `<button id="terminal-send">`.
    -   Output is displayed in `<div id="terminal-output">`.
    -   Commands are sent to the local Node.js backend (`server.cjs`).

### 2.2 Backend (`server.cjs`)

-   **Technology**: Node.js with Express.
-   **Purpose**: Provides a `/exec` endpoint to safely execute shell commands on the local machine.
-   **Authentication**: Uses a simple Bearer token (`TOKEN`) for authorization. The token must match the one configured in `index.html`.
-   **Security**: Includes a critical warning about the security risks of executing arbitrary commands. This server is intended for local, trusted environments only.

## 3. Critical Developer Workflows

### 3.1 Running the Application

1.  **Start the Backend Server**:
    -   Navigate to the project root (`c:\Gemini chat`) in your system's terminal (e.g., PowerShell, Command Prompt).
    -   If not already installed, install Node.js dependencies: `npm install express body-parser cors`.
    -   Start the server: `node server.cjs`.
    -   Ensure the server is running on `http://localhost:3001` (or the configured `PORT`).
2.  **Open the Frontend**:
    -   Open `index.html` directly in a web browser.

### 3.2 Configuration

-   **API Key & Model**: The Gemini API key and model can be configured via the "⚙️" button on the frontend, which opens `#config-modal`.
-   **Terminal Server URL/Token**: The `SERVER_URL` and `TOKEN` constants in `index.html` must match the `PORT` and `TOKEN` defined in `server.cjs`.

## 4. Project-Specific Conventions

-   **Single-File Frontend**: All HTML, CSS, and JavaScript for the frontend are contained within `index.html`.
-   **Local Storage for State**: Conversation history and user configurations are persisted using `localStorage`.
-   **Markdown Rendering**: AI responses are expected to potentially contain Markdown, especially code blocks, which are custom-rendered.

## 5. Integration Points

-   **Google Gemini API**: For AI chat responses.
-   **Local Node.js Server (`server.cjs`)**: For executing terminal commands. Communication is via `fetch` API to `http://127.0.0.1:3001/exec` with Bearer token authentication.

## 6. Key Files and Directories

-   `index.html`: Main frontend application.
-   `server.cjs`: Node.js backend for terminal command execution.

---
Please provide feedback if any sections are unclear or incomplete.
