// 10x10 크기의 빈 보드 생성 함수
function generateBoard() {
    const board = [];
    for (let i = 0; i < 10; i++) {
        const row = [];
        for (let j = 0; j < 10; j++) {
            row.push({ revealed: false, mine: Math.random() < 0.2, adjacentMines: 0, flagged: false });
        }
        board.push(row);
    }
    return board;
}

// 보드 주변 8칸의 지뢰 수 계산 함수
function calculateAdjacentMines(board) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].mine) continue;

            let count = 0;
            directions.forEach(([dx, dy]) => {
                const newRow = i + dx;
                const newCol = j + dy;
                if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[i].length) {
                    if (board[newRow][newCol].mine) count++;
                }
            });
            board[i][j].adjacentMines = count;
        }
    }
}

const playerBoardGrid = document.getElementById('player-board-grid');
let playerBoard = generateBoard();
let gameEnded = false;

calculateAdjacentMines(playerBoard);

// 타이머 설정
let time = 0;
const timerElement = document.getElementById('timer');
setInterval(() => {
    if (!gameEnded) {
        time += 1;
        timerElement.innerText = `⏱️ ${time}`;
    }
}, 1000);

// 보드 렌더링 함수
function renderBoard(board, grid) {
    grid.innerHTML = '';
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            if (cell.revealed) {
                cellDiv.classList.add('revealed');
                if (cell.mine) {
                    cellDiv.innerText = '💣';
                    cellDiv.classList.add('mine');
                } else if (cell.adjacentMines > 0) {
                    cellDiv.setAttribute('data-adjacent', cell.adjacentMines);
                    cellDiv.innerText = cell.adjacentMines;
                }
            } else if (cell.flagged) {
                cellDiv.innerText = '🚩';
                cellDiv.classList.add('flagged');
            }

            cellDiv.addEventListener('click', () => handlePlayerMove(rowIndex, colIndex));
            cellDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleFlagging(rowIndex, colIndex);
            });

            grid.appendChild(cellDiv);
        });
    });
}

// 플레이어가 클릭했을 때 호출되는 함수
function handlePlayerMove(row, col) {
    if (gameEnded) return;

    const cell = playerBoard[row][col];

    if (cell.revealed || cell.flagged) return; // 이미 클릭된 셀 또는 깃발 표시된 셀은 무시

    cell.revealed = true;

    if (cell.mine) {
        alert('게임 오버!');
        gameEnded = true;
    } else if (cell.adjacentMines === 0) {
        revealAdjacent(row, col, playerBoard); // 인접한 빈 칸들도 열기
    }

    renderBoard(playerBoard, playerBoardGrid);

    // 게임 종료 조건 확인
    if (checkWinCondition()) {
        alert("게임 클리어!");
        gameEnded = true;
    }
}

// 깃발 표시 기능 (우클릭)
function handleFlagging(row, col) {
    if (gameEnded) return;

    const cell = playerBoard[row][col];

    if (!cell.revealed) {
        cell.flagged = !cell.flagged;
    }

    renderBoard(playerBoard, playerBoardGrid);
}

// 주변 빈 칸 열기
function revealAdjacent(row, col, board) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
            const adjacentCell = board[newRow][newCol];
            if (!adjacentCell.revealed && !adjacentCell.mine && !adjacentCell.flagged) {
                adjacentCell.revealed = true;
                if (adjacentCell.adjacentMines === 0) {
                    revealAdjacent(newRow, newCol, board); // 주변에도 지뢰가 없으면 계속해서 열기
                }
            }
        }
    });
}

// 승리 조건 확인
function checkWinCondition() {
    for (let row of playerBoard) {
        for (let cell of row) {
            if (!cell.mine && !cell.revealed) {
                return false;
            }
        }
    }
    return true;
}

// 인게임 화면 렌더링 함수
renderBoard(playerBoard, playerBoardGrid);
