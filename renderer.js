// --------- Utilidades ----------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getBlockDims(size) {
  if (size === 3) return { br: 1, bc: 3 };
  if (size === 6) return { br: 2, bc: 3 };
  if (size === 9) return { br: 3, bc: 3 };
  throw new Error("Tamaño no soportado");
}

function shuffledIndexOrder(total, groupSize) {
  const groups = Array.from({ length: total / groupSize }, (_, g) => g);
  shuffle(groups);
  const order = [];
  for (const g of groups) {
    const members = Array.from({ length: groupSize }, (_, i) => g * groupSize + i);
    shuffle(members);
    order.push(...members);
  }
  return order;
}

function patternIndex(r, c, br, bc, size) {
  return (bc * (r % br) + Math.floor(r / br) + c) % size;
}

// --------- Generador de solución ----------
function generarSolucion(size) {
  const { br, bc } = getBlockDims(size);
  const rows = shuffledIndexOrder(size, br);
  const cols = shuffledIndexOrder(size, bc);
  const nums = shuffle(Array.from({ length: size }, (_, i) => i + 1));

  const board = Array.from({ length: size }, () => Array(size).fill(0));
  for (let ri = 0; ri < size; ri++) {
    for (let ci = 0; ci < size; ci++) {
      const r = rows[ri];
      const c = cols[ci];
      board[ri][ci] = nums[patternIndex(r, c, br, bc, size)];
    }
  }
  return board;
}

// --------- Crear puzzle ----------
function crearPuzzle(board, size) {
  const puzzle = board.map(row => [...row]);
  let quitar;
  if (size === 3) quitar = 3;
  if (size === 6) quitar = 15;
  if (size === 9) quitar = 40;

  while (quitar > 0) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      quitar--;
    }
  }
  return puzzle;
}

// --------- Render tablero ----------
let solucionGlobal = null;
let sizeGlobal = null;

function renderTablero(puzzle, size) {
  const container = document.getElementById("sudoku-container");
  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = `repeat(${size}, 40px)`;

  const isValidChar = (ch) => {
    const n = Number(ch);
    return Number.isInteger(n) && n >= 1 && n <= size;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = "1";
      input.className = "cell";
      input.dataset.row = r;
      input.dataset.col = c;

      if (puzzle[r][c] !== 0) {
        input.value = puzzle[r][c];
        input.disabled = true;
        input.style.background = "#ddd";
      } else {
        input.addEventListener("input", (e) => {
          const v = e.target.value.trim();
          if (v === "") return;
          if (!isValidChar(v)) {
            e.target.value = "";
          }
        });
      }

      container.appendChild(input);
    }
  }
}

// --------- Validar tablero ----------
function comprobarTablero() {
  const inputs = document.querySelectorAll("#sudoku-container input");
  const board = Array.from({ length: sizeGlobal }, () => Array(sizeGlobal).fill(0));

  for (const input of inputs) {
    const r = parseInt(input.dataset.row);
    const c = parseInt(input.dataset.col);
    board[r][c] = input.value ? parseInt(input.value) : 0;
  }

  // Comparar con solución
  for (let r = 0; r < sizeGlobal; r++) {
    for (let c = 0; c < sizeGlobal; c++) {
      if (board[r][c] !== solucionGlobal[r][c]) {
        alert("❌ El tablero tiene errores o está incompleto.");
        return;
      }
    }
  }
  alert("✅ ¡Felicitaciones! Sudoku resuelto correctamente.");
}

// --------- Resolver tablero ----------
function resolverTablero() {
  const inputs = document.querySelectorAll("#sudoku-container input");
  for (const input of inputs) {
    const r = parseInt(input.dataset.row);
    const c = parseInt(input.dataset.col);
    input.value = solucionGlobal[r][c];
    input.disabled = true;
    input.style.background = "#cfc";
  }
}

// --------- API ----------
function iniciarJuego(size) {
  sizeGlobal = size;
  solucionGlobal = generarSolucion(size);
  const puzzle = crearPuzzle(solucionGlobal, size);
  renderTablero(puzzle, size);
}

// Exponer funciones globalmente
window.iniciarJuego = iniciarJuego;
window.comprobarTablero = comprobarTablero;
window.resolverTablero = resolverTablero;
