function iniciarJuego(size) {
  const container = document.getElementById("sudoku-container");
  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = `repeat(${size}, 40px)`;

  // Generar tablero completo (simplificado)
  let board = generarSudoku(size);

  // Crear puzzle borrando celdas
  let puzzle = crearPuzzle(board, size);

  // Pintar grilla
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = "1";
      input.className = "cell";

      if (puzzle[r][c] !== 0) {
        input.value = puzzle[r][c];
        input.disabled = true;
        input.style.background = "#ddd";
      }

      container.appendChild(input);
    }
  }
}

// ---------------- Generador simplificado ----------------

function generarSudoku(size) {
  // ⚠️ Por ahora generamos una matriz válida "aproximada" (no 100% Sudoku real)
  let board = Array.from({ length: size }, () => Array(size).fill(0));

  // Rellenar con números 1..size en diagonal (para asegurar validez básica)
  for (let i = 0; i < size; i++) {
    board[i][i] = (i % size) + 1;
  }

  // Rellenar random en el resto solo para ver algo
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) {
        board[r][c] = Math.floor(Math.random() * size) + 1;
      }
    }
  }

  return board;
}

function crearPuzzle(board, size) {
  let puzzle = board.map(row => [...row]);
  let celdasABorrar;

  if (size === 3) celdasABorrar = 3;
  if (size === 6) celdasABorrar = 15;
  if (size === 9) celdasABorrar = 40;

  while (celdasABorrar > 0) {
    let r = Math.floor(Math.random() * size);
    let c = Math.floor(Math.random() * size);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      celdasABorrar--;
    }
  }
  return puzzle;
}
