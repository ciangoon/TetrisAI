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

- Tkinter UI (`tetris/visual.py`):
  - Arrow Left/Right: move
  - Arrow Down: soft drop
  - Space: hard drop
  - Up or `z`: rotate clockwise
  - `x`: rotate anticlockwise
  - Escape: quit

- Pygame UI (`tetris/visual-pygame.py`):
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

## License

MIT (or your chosen license). Replace this section if different.
