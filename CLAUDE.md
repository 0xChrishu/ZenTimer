# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZenTimer is a Pomodoro timer web application built with vanilla JavaScript. No build process or dependencies required - it's a simple static web app.

## Running the Application

To run the app, serve the files with any HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server (if installed)
npx http-server

# Or simply open index.html in a browser (some features may be limited)
```

Then navigate to `http://localhost:8000`

## Architecture

The app follows a simple class-based architecture:

- **Single class pattern**: `PomodoroTimer` class in [app.js](app.js) encapsulates all application state and logic
- **State management**: All state is stored as class properties (`currentMode`, `timeLeft`, `isRunning`, `pomodoroCount`)
- **Persistence**: Uses `localStorage` to save settings and completed pomodoro count
- **No framework**: Pure vanilla JavaScript with direct DOM manipulation

## Key Design Patterns

1. **Mode-based theming**: The container receives a class like `mode-pomodoro`, `mode-shortbreak`, `mode-longbreak` which CSS uses to style the entire app differently

2. **Time calculations**: All time is stored as seconds internally, converted to `MM:SS` format only for display

3. **Event delegation**: Event listeners are attached once in `attachEventListeners()` using element references cached in `this.elements`

## File Structure

- `index.html` - Single HTML file with all UI markup
- `style.css` - All styles including mode-based color theming via CSS custom properties
- `app.js` - Single `PomodoroTimer` class with all application logic

## Browser APIs Used

- **localStorage** - Persist settings and pomodoro count
- **Web Audio API** - Generate notification sounds (no audio files needed)
- **Notification API** - Desktop notifications when timer completes
