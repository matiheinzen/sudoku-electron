 let partidasJugadas = 0;
  let partidasCorrectas = 0;
  let partidasResueltas = 0;
  let resueltaAutomaticamente = false;

  let pistasMaximas = 3;
  let pistasUsadas = 0;

  let size = 9;
  let solucion = [];
  let timerInterval;
  let segundos = 0;

  let subRows = 3;
  let subCols = 3;

  function iniciarJuego(nivel) {
    if (timerInterval) clearInterval(timerInterval);
    segundos = 0;
    document.getElementById("timer").textContent = "00:00";
    document.getElementById("timer-container").style.display = "block";
    document.getElementById("mensaje").textContent = "";

    resueltaAutomaticamente = false;
    pistasUsadas = 0;

    if (nivel === "facil") {
      size = 4;
      subRows = 2; subCols = 2;
      pistasMaximas = 1;
    } else if (nivel === "medio") {
      size = 6;
      subRows = 2; subCols = 3;
      pistasMaximas = 2;
    } else {
      size = 9;
      subRows = 3; subCols = 3;
      pistasMaximas = 3;
    }

    generarSudoku();
    partidasJugadas++;
    actualizarEstadisticas();
    iniciarTimer();
  }

  function generarSudoku() {
    const sudokuContainer = document.getElementById("sudoku-container");
    sudokuContainer.innerHTML = "";
    sudokuContainer.style.gridTemplateRows = `repeat(${size}, 40px)`;
    sudokuContainer.style.gridTemplateColumns = `repeat(${size}, 40px)`;
    sudokuContainer.style.display = "grid";

    solucion = generarSolucion();
    let tablero = JSON.parse(JSON.stringify(solucion));

    let porcentajeVacio = (size === 4 || size === 6) ? 0.45 : 0.6;
    let celdasVacias = Math.floor(size * size * porcentajeVacio);
    eliminarCeldas(tablero, celdasVacias);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const cell = document.createElement("input");
        cell.type = "text";
        cell.maxLength = 2;
        cell.dataset.row = i;
        cell.dataset.col = j;
        if (tablero[i][j] !== 0) {
          cell.value = tablero[i][j];
          cell.disabled = true;
          cell.classList.add("fijo");
        }
        cell.addEventListener("input", (e) => {
          const val = e.target.value;
          if (!/^[0-9]$/.test(val)) e.target.value = "";
        });
        sudokuContainer.appendChild(cell);
      }
    }
  }

  function generarSolucion() {
    let grid = Array.from({ length: size }, () => Array(size).fill(0));
    resolverBacktracking(grid);
    return grid;
  }

  function resolverBacktracking(grid) {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (grid[row][col] === 0) {
          let nums = Array.from({ length: size }, (_, i) => i + 1);
          for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
          }
          for (let num of nums) {
            if (esValido(grid, row, col, num)) {
              grid[row][col] = num;
              if (resolverBacktracking(grid)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  function esValido(grid, row, col, num) {
    for (let x = 0; x < size; x++) {
      if (grid[row][x] === num || grid[x][col] === num) return false;
    }
    let startRow = Math.floor(row / subRows) * subRows;
    let startCol = Math.floor(col / subCols) * subCols;
    for (let r = startRow; r < startRow + subRows; r++) {
      for (let c = startCol; c < startCol + subCols; c++) {
        if (grid[r][c] === num) return false;
      }
    }
    return true;
  }

  function eliminarCeldas(grid, cantidad) {
    let vaciadas = 0;
    while (vaciadas < cantidad) {
      let i = Math.floor(Math.random() * size);
      let j = Math.floor(Math.random() * size);
      if (grid[i][j] !== 0) {
        grid[i][j] = 0;
        vaciadas++;
      }
    }
  }

  function comprobarTablero() {
    if (resueltaAutomaticamente) {
      clearInterval(timerInterval);
      document.getElementById("mensaje").textContent =
        "El juego fue resuelto automáticamente, partida finalizada.";
      document.getElementById("mensaje").style.color = "orange";
      return;
    }
    let correcto = true;
    const inputs = document.querySelectorAll("#sudoku-container input");
    inputs.forEach(input => {
      let i = parseInt(input.dataset.row);
      let j = parseInt(input.dataset.col);
      if (parseInt(input.value) !== solucion[i][j]) correcto = false;
    });
    if (correcto) {
      clearInterval(timerInterval);
      partidasCorrectas++;
      actualizarEstadisticas();
      document.getElementById("mensaje").textContent = "¡Correcto! 🎉";
      document.getElementById("mensaje").style.color = "green";
    } else {
      document.getElementById("mensaje").textContent = "Hay errores ❌";
      document.getElementById("mensaje").style.color = "red";
    }
  }

  function resolverTablero() {
    const inputs = document.querySelectorAll("#sudoku-container input");
    inputs.forEach(input => {
      let i = parseInt(input.dataset.row);
      let j = parseInt(input.dataset.col);
      input.value = solucion[i][j];
      input.disabled = true;
      input.classList.add("fijo");
    });
    partidasResueltas++;
    resueltaAutomaticamente = true;
    actualizarEstadisticas();
    document.getElementById("mensaje").textContent =
      "Tablero resuelto automáticamente.";
    document.getElementById("mensaje").style.color = "blue";
  }

  function darPista() {
    if (pistasUsadas >= pistasMaximas) {
      document.getElementById("mensaje").textContent = "Ya usaste todas tus pistas.";
      document.getElementById("mensaje").style.color = "red";
      return;
    }
    const inputs = document.querySelectorAll("#sudoku-container input");
    let vacios = [];
    inputs.forEach(input => {
      let i = parseInt(input.dataset.row);
      let j = parseInt(input.dataset.col);
      if (input.value === "") vacios.push({ input, i, j });
    });
    if (vacios.length > 0) {
      const random = vacios[Math.floor(Math.random() * vacios.length)];
      random.input.value = solucion[random.i][random.j];
      random.input.disabled = true;
      random.input.classList.add("pista");
      pistasUsadas++;
      document.getElementById("mensaje").textContent = "";
    }
  }

  function iniciarTimer() {
    timerInterval = setInterval(() => {
      segundos++;
      let min = String(Math.floor(segundos / 60)).padStart(2, "0");
      let sec = String(segundos % 60).padStart(2, "0");
      document.getElementById("timer").textContent = `${min}:${sec}`;
    }, 1000);
  }

  function actualizarEstadisticas() {
    document.getElementById("jugadas").textContent = partidasJugadas;
    document.getElementById("correctas").textContent = partidasCorrectas;
    document.getElementById("resueltas").textContent = partidasResueltas;
  }