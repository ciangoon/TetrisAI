# TetrisAI

A simple Tetris implementation with multiple UIs and an autoplayer AI.

- Tkinter UI (lightweight window)
- Pygame UI (graphical)
- Autoplayer (heuristic AI) or manual play

## Requirements

- Python 3.8+
- For Tkinter UI: Tkinter available with your Python distribution
- For Pygame UI: `pygame` installed (`pip install pygame`)

Optional installs:

```bash
pip install pygame
```

## How to Run

All entry points live under `tetris/` and can be executed directly.

### 1) Tkinter UI

```bash
python tetris/visual.py             # Autoplayer (AI)
python tetris/visual.py --manual    # Manual play
```

### 2) Pygame UI

```bash
python tetris/visual-pygame.py             # Autoplayer (AI)
python tetris/visual-pygame.py --manual    # Manual play
```

## Controls (Manual Mode)

- Arrow Left/Right: move
- Arrow Down: soft drop
- Space: hard drop
- Up: rotate clockwise
- `z`: rotate anticlockwise
- `x`: rotate clockwise
- Escape or close window: quit

## Autoplayer (AI)

By default (without `--manual`), the selected player is the AI defined in `tetris/player.py` (`SelectedPlayer = Player`). The AI evaluates each possible position/rotation using a heuristic combining:

- Aggregate column heights
- Board smoothness (adjacent height differences)
- Completed lines
- Holes

Weights for these terms are configurable in code (`tetris/player.py`). The AI returns a sequence of moves to position and drop the current piece.

To watch the AI play:

```bash
python tetris/visual.py           # Tkinter
python tetris/visual-pygame.py    # Pygame
python tetris/cmdline.py          # Text
```

## Game Rules & Scoring

- Standard Tetris board size: 10x24 (see `tetris/constants.py`)
- Score is shown in the window title (Tkinter/Pygame) or bottom of screen (Text UI)
- The next piece preview is shown to the right of the board

## Configuration

- Board size, default seed, tick interval, block limit and game speed are in `tetris/constants.py`.
- Autoplayer weights are in `tetris/player.py` (see `holes_weight`, `smoothness_weight`, `complete_lines_weight`, `aggregateHeight_weight`).

## Troubleshooting

- If the window does not appear (Tkinter), ensure your Python has Tk support.
- For Pygame, ensure `pygame` is installed and the display can be initialized.

# React Web App (for the browser)

A separate React + TypeScript app lives under `web/` for deployment to Vercel. It reimplements the core game/AI in TS and runs entirely client‑side.

- Structure (key files):
  - `web/src/engine/enums.ts`: `Direction`, `Rotation`, `Shape`, board constants
  - `web/src/engine/Block.ts`: block geometry, rotation, movement
  - `web/src/engine/Board.ts`: board state, collisions, line clears, scoring
  - `web/src/ai/Player.ts`: heuristic AI (holes, height, transitions, wells, etc.)
  - `web/src/components/TetrisCanvas.tsx`: canvas renderer, game loop, input, ghost piece, resizable box, speed slider, game‑over detection
  - `web/src/App.tsx`: UI shell (centered canvas, start screen to choose manual or autoplay, autoplay toggle, score, restart with spinner)
  - `web/index.html`, `web/vite.config.ts`, `web/tsconfig.json`: Vite + TS setup

- Features:
  - Manual play with the same controls as Python
  - Autoplayer with adjustable speed (slider)
  - Ghost silhouette showing landing position
  - Resizable play area (drag handle)
  - Start screen (choose manual or autoplay), game‑over overlay

- Local development:
  ```bash
  cd web
  npm install
  npm run dev
  # open the shown localhost URL
  ```

- Deploy to Vercel (Dashboard):
  - New Project → Import repo → set Root Directory to `web/`
  - Build command: `npm run build`  •  Output directory: `dist`
  - Deploy


## License

MIT (or your chosen license). Replace this section if different.
