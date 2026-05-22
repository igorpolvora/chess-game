const API = 'http://localhost:8080/api/game';

  const PIECE_SYMBOLS = {
    WHITE: { K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙' },
    BLACK: { K:'♚', Q:'♛', R:'♜', B:'♝', N:'♞', P:'♟' }
  };

  let gameId = null;
  let gameState = null;
  let selectedSquare = null;
  let possibleMoves = null;
  let capturedWhite = [];
  let capturedBlack = [];

  const boardEl      = document.getElementById('board');
  const statusPill   = document.getElementById('statusPill');
  const messageBar   = document.getElementById('messageBar');
  const currentPlayerEl = document.getElementById('currentPlayer');
  const turnDot      = document.getElementById('turnDot');
  const turnCountEl  = document.getElementById('turnCount');
  const capturedWEl  = document.getElementById('capturedWhite');
  const capturedBEl  = document.getElementById('capturedBlack');
  const resignBtn    = document.getElementById('resignBtn');

  function buildCoords() {
    const ranks = document.getElementById('rankCoords');
    const files = document.getElementById('fileCoords');
    for (let r = 8; r >= 1; r--) {
      const d = document.createElement('div');
      d.textContent = r;
      ranks.appendChild(d);
    }
    'abcdefgh'.split('').forEach(f => {
      const d = document.createElement('div');
      d.textContent = f;
      files.appendChild(d);
    });
  }

  function rowColToChess(row, col) {
    return String.fromCharCode(97 + col) + (8 - row);
  }

  function renderBoard(board, possible, state) {
    boardEl.innerHTML = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        sq.classList.add('square', (r + c) % 2 === 0 ? 'light' : 'dark');
        sq.dataset.row = r;
        sq.dataset.col = c;

        const piece = board[r][c];
        const pos = rowColToChess(r, c);

        if (selectedSquare === pos) sq.classList.add('selected');

        if (possible) {
          const hasPiece = board[r][c] !== null;
          if (possible[r][c]) sq.classList.add(hasPiece ? 'possible-capture' : 'possible');
        }

        if (state && state.check && piece && piece.type === 'K' && piece.color === state.currentPlayer) {
          sq.classList.add('in-check');
        }

        if (piece) {
          const span = document.createElement('span');
          span.classList.add('piece', piece.color === 'WHITE' ? 'white' : 'black');
          span.textContent = PIECE_SYMBOLS[piece.color][piece.type] || '?';
          sq.appendChild(span);
        }

        sq.addEventListener('click', () => handleSquareClick(r, c, pos, piece));
        boardEl.appendChild(sq);
      }
    }
  }

  async function handleSquareClick(row, col, pos, piece) {
    if (!gameId || gameState?.checkMate) return;

    if (selectedSquare === null) {
      if (!piece) return;
      if (piece.color !== gameState.currentPlayer) {
        showMessage('Essa peça não é sua.', 'error');
        return;
      }
      selectedSquare = pos;
      try {
        const res = await fetch(`${API}/${gameId}/possible-moves`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: pos })
        });
        possibleMoves = await res.json();
        const hasMoves = possibleMoves.some(r => r.some(v => v));
        if (!hasMoves) { selectedSquare = null; possibleMoves = null; showMessage('Sem movimentos possíveis.', 'error'); return; }
        renderBoard(gameState.board, possibleMoves, gameState);
        showMessage(`Peça selecionada em ${pos.toUpperCase()}. Escolha o destino.`, 'info');
      } catch(e) { showMessage('Erro ao buscar movimentos.', 'error'); selectedSquare = null; }

    } else {
      if (pos === selectedSquare) {
        selectedSquare = null; possibleMoves = null;
        renderBoard(gameState.board, null, gameState);
        showMessage('Seleção cancelada.', '');
        return;
      }
      const fromPos = selectedSquare;
      selectedSquare = null;
      possibleMoves = null;
      await makeMove(fromPos, pos);
    }
  }

  async function makeMove(from, to) {
    try {
      const res = await fetch(`${API}/${gameId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to })
      });
      if (!res.ok) {
        const err = await res.json();
        showMessage(err.error || 'Movimento inválido.', 'error');
        renderBoard(gameState.board, null, gameState);
        return;
      }
      const newState = await res.json();
      updateCaptured(gameState.board, newState.board);
      gameState = newState;
      renderBoard(gameState.board, null, gameState);
      updatePanel();

      if (gameState.checkMate) {
        const winner = gameState.currentPlayer === 'WHITE' ? 'Pretas' : 'Brancas';
        document.getElementById('winnerText').textContent = `${winner} vencem!`;
        document.getElementById('checkmateOverlay').style.display = 'flex';
        return;
      }
      if (gameState.check) showMessage('Xeque!', 'error');
      else showMessage(`Vez das ${gameState.currentPlayer === 'WHITE' ? 'Brancas' : 'Pretas'}.`, '');

    } catch(e) {
      showMessage('Erro de conexão com o servidor.', 'error');
    }
  }

  function updateCaptured(oldBoard, newBoard) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const old = oldBoard[r][c];
        const nw  = newBoard[r][c];
        if (old && (!nw || (nw.type !== old.type || nw.color !== old.color))) {
          if (old.color === 'WHITE') capturedWhite.push(old);
          else capturedBlack.push(old);
        }
      }
    }
    capturedWEl.textContent = capturedWhite.map(p => PIECE_SYMBOLS.WHITE[p.type]).join(' ');
    capturedBEl.textContent = capturedBlack.map(p => PIECE_SYMBOLS.BLACK[p.type]).join(' ');
  }

  function updatePanel() {
    if (!gameState) return;
    const isWhite = gameState.currentPlayer === 'WHITE';
    currentPlayerEl.textContent = isWhite ? 'Brancas' : 'Pretas';
    turnDot.className = 'turn-dot ' + (isWhite ? 'white-turn' : 'black-turn');
    turnCountEl.textContent = `#${gameState.turn}`;
    statusPill.textContent = gameState.check ? '● Xeque!' : '● Conectado';
    statusPill.className = 'status-pill ' + (gameState.check ? 'check' : 'connected');
  }

  function showMessage(msg, type = '') {
    messageBar.textContent = msg;
    messageBar.className = 'message-bar ' + type;
  }

  async function startNewGame() {
    selectedSquare = null;
    possibleMoves = null;
    capturedWhite = [];
    capturedBlack = [];
    capturedWEl.textContent = '';
    capturedBEl.textContent = '';

    try {
      showMessage('Criando partida...', 'info');
      const res = await fetch(API, { method: 'POST' });
      if (!res.ok) throw new Error();
      gameState = await res.json();
      gameId = gameState.gameId;
      renderBoard(gameState.board, null, gameState);
      updatePanel();
      showMessage('Partida iniciada! Brancas começam.', 'success');
      resignBtn.disabled = false;
      document.getElementById('startOverlay').style.display = 'none';
      document.getElementById('checkmateOverlay').style.display = 'none';
    } catch(e) {
      showMessage('Erro: backend não encontrado em localhost:8080', 'error');
      statusPill.textContent = '● Offline';
      statusPill.className = 'status-pill';
    }
  }

  document.getElementById('newGameBtn').addEventListener('click', startNewGame);
  document.getElementById('startBtn').addEventListener('click', startNewGame);
  document.getElementById('rematchBtn').addEventListener('click', startNewGame);
  document.getElementById('resignBtn').addEventListener('click', () => {
    if (gameId) {
      const winner = gameState.currentPlayer === 'WHITE' ? 'Pretas' : 'Brancas';
      document.getElementById('winnerText').textContent = `${winner} vencem por abandono.`;
      document.getElementById('checkmateOverlay').style.display = 'flex';
    }
  });

  buildCoords();
  renderBoard(Array(8).fill(null).map(() => Array(8).fill(null)), null, null);