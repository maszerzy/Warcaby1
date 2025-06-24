
const board = document.getElementById("board");
const info = document.getElementById("info");
const scoreRed = document.getElementById("score-red");
const scoreBlack = document.getElementById("score-black");

let selected = null;
let currentPlayer = "red";
let pieces = [];
let score = { red: 0, black: 0 };

function createBoard() {
  board.innerHTML = "";
  pieces = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const square = document.createElement("div");
      square.className = "square " + ((x + y) % 2 === 0 ? "light" : "dark");
      square.dataset.x = x;
      square.dataset.y = y;
      board.appendChild(square);
      if ((x + y) % 2 === 1 && (y < 3 || y > 4)) {
        const piece = document.createElement("div");
        piece.className = "piece " + (y < 3 ? "black" : "red");
        piece.dataset.color = y < 3 ? "black" : "red";
        piece.dataset.king = "false";
        square.appendChild(piece);
        pieces.push({ x, y, color: piece.dataset.color, king: false, el: piece });
      }
    }
  }
  updateInfo();
}

function updateScore() {
  scoreRed.textContent = `Czerwony: ${score.red}`;
  scoreBlack.textContent = `Czarny: ${score.black}`;
}

function updateInfo(text) {
  info.textContent = text || `Tura gracza: ${currentPlayer === "red" ? "Czerwony" : "Czarny"}`;
}

function getPiece(x, y) {
  return pieces.find(p => p.x == x && p.y == y);
}

function getSquare(x, y) {
  return document.querySelector(`.square[data-x="${x}"][data-y="${y}"]`);
}

function removePiece(p) {
  p.el.remove();
  pieces = pieces.filter(pi => pi !== p);
  score[currentPlayer]++;
  updateScore();
}

function movePiece(p, x, y) {
  const square = getSquare(x, y);
  p.x = x;
  p.y = y;
  square.appendChild(p.el);
  if ((p.color === "red" && y === 0) || (p.color === "black" && y === 7)) {
    p.king = true;
    p.el.classList.add("king");
  }
}

function getMoves(p, skip = []) {
  const dirs = p.king ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] :
    (p.color === "red" ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);
  let moves = [];

  for (let [dy, dx] of dirs) {
    let nx = p.x + dx, ny = p.y + dy;
    if (nx < 0 || nx > 7 || ny < 0 || ny > 7) continue;
    if (!getPiece(nx, ny)) {
      moves.push({ x: nx, y: ny, capture: null });
    } else {
      let mid = getPiece(nx, ny);
      if (mid.color !== p.color && !skip.includes(mid)) {
        let jumpX = nx + dx, jumpY = ny + dy;
        if (jumpX >= 0 && jumpX <= 7 && jumpY >= 0 && jumpY <= 7 && !getPiece(jumpX, jumpY)) {
          moves.push({ x: jumpX, y: jumpY, capture: mid });
        }
      }
    }
  }
  return moves;
}

function handleClickSquare(e) {
  const x = +e.currentTarget.dataset.x;
  const y = +e.currentTarget.dataset.y;
  const clickedPiece = getPiece(x, y);

  if (clickedPiece && clickedPiece.color === currentPlayer) {
    if (selected) selected.el.classList.remove("selected");
    selected = clickedPiece;
    selected.el.classList.add("selected");
  } else if (selected) {
    const moves = getMoves(selected);
    const move = moves.find(m => m.x === x && m.y === y);
    if (move) {
      if (move.capture) {
        removePiece(move.capture);
      }
      movePiece(selected, x, y);
      if (move.capture) {
        const further = getMoves(selected, [move.capture]).filter(m => m.capture);
        if (further.length > 0) {
          selected.el.classList.add("selected");
          return;
        }
      }
      selected.el.classList.remove("selected");
      selected = null;
      currentPlayer = currentPlayer === "red" ? "black" : "red";
      updateInfo();
    }
  }
}

board.addEventListener("click", e => {
  const sq = e.target.closest(".square");
  if (sq) handleClickSquare({ currentTarget: sq });
});

createBoard();
updateScore();
