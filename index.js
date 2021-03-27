const canvas = document.getElementById('canvas');
const message = document.getElementById('message');
const retry = document.getElementById('retry');
const ctx = canvas.getContext('2d');

const PLAYERS = {
	human: 'x',
	computer: 'o',
};

const END_MESSAGES = {
	x: 'Human wins!',
	o: 'Computer wins!',
	tie: "It's a tie!",
};

const SCORES = {
	x: -10,
	o: 10,
	tie: 0,
};

const size = canvas.width / 3;
const padding = 50;

const board = [
	['', '', ''],
	['', '', ''],
	['', '', ''],
];

let gameRunning;

// ****************************************************************

function startGame() {
	drawBoard();
	canvas.addEventListener('click', humanMove);
	gameRunning = true;
}

function stopGame() {
	canvas.removeEventListener('click', humanMove);
	retry.style.display = 'block';
	gameRunning = false;
}

function restartGame() {
	location.reload();
}

function drawBoard() {
	ctx.beginPath();
	ctx.moveTo(size, 0);
	ctx.lineTo(size, canvas.height);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(size * 2, 0);
	ctx.lineTo(size * 2, canvas.height);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0, size);
	ctx.lineTo(canvas.width, size);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(0, size * 2);
	ctx.lineTo(canvas.width, size * 2);
	ctx.stroke();

	ctx.lineWidth = 3;
}

function drawX(x, y) {
	ctx.beginPath();
	ctx.moveTo(x * size + padding, y * size + padding);
	ctx.lineTo(x * size + (size - padding), y * size + (size - padding));
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(x * size + (size - padding), y * size + padding);
	ctx.lineTo(x * size + padding, y * size + (size - padding));
	ctx.stroke();
}

function drawO(x, y) {
	ctx.beginPath();
	ctx.arc(x * size + size / 2, y * size + size / 2, (size - padding - 20) / 2, 0, 2 * Math.PI);
	ctx.stroke();
}

function drawVerticalLine(x) {
	ctx.beginPath();
	ctx.moveTo(size / 2 + x * size, 0);
	ctx.lineTo(size / 2 + x * size, canvas.height);
	ctx.stroke();
}

function drawHorizontalLine(y) {
	ctx.beginPath();
	ctx.moveTo(0, size / 2 + y * size);
	ctx.lineTo(canvas.width, size / 2 + y * size);
	ctx.stroke();
}

function drawDiagonalLine(x) {
	ctx.beginPath();
	ctx.moveTo(x === 0 ? 0 : canvas.width, 0);
	ctx.lineTo(x === 0 ? canvas.width : 0, canvas.height);
	ctx.stroke();
}

function check3(a, b, c) {
	return !!a && a === b && b === c;
}

function checkWinner(aiCheck = false) {
	// horizontal	
	for (let i = 0; i < 3; i++) {
		if (check3(board[0][i], board[1][i], board[2][i])) {
			if (!aiCheck) {
				drawHorizontalLine(i);
			}

			return board[0][i];
		}
	}

	// vertical
	for (let i = 0; i < 3; i++) {
		if (check3(board[i][0], board[i][1], board[i][2])) {
			if (!aiCheck) {
				drawVerticalLine(i);
			}

			return board[i][0];
		}
	}

	// diagonal
	if (check3(board[0][0], board[1][1], board[2][2])) {
		if (!aiCheck) {
			drawDiagonalLine(0);
		}

		return board[0][0];
	}

	if (check3(board[2][0], board[1][1], board[0][2])) {
		if (!aiCheck) {
			drawDiagonalLine(2);
		}

		return board[2][0];
	}

	// tie
	if (!getAvailableMoves().length) {
		return 'tie';
	}
}

function checkBoard() {
	const winner = checkWinner();

	if (winner) {
		message.innerHTML = END_MESSAGES[winner];
		stopGame();
	}
}

function getAvailableMoves() {
	const available = [];

	for (let x = 0; x < 3; x++) {
		for (let y = 0; y < 3; y++) {
			if (!board[x][y]) {
				available.push({ x, y });
			}
		}
	}

	return available;
}

function computerMove() {
	let pos;
	let bestScore = -Infinity;

	getAvailableMoves().forEach(({ x, y }) => {
		board[x][y] = PLAYERS.computer;
		const score = minimax(board, 0, false);
		board[x][y] = '';
		if (score > bestScore) {
			pos = { x, y };
			bestScore = score;
		}
	});

	board[pos.x][pos.y] = PLAYERS.computer;
	drawO(pos.x, pos.y);
	checkBoard();
}

/**
 * Minimax algorithm for calculating the best move
 */
function minimax(board, depth, isMax) {
	// if the game ended return the score
	const winner = checkWinner(true);
	if (winner) {
		return SCORES[winner] - depth;
	}

	let bestScore = isMax ? -Infinity : Infinity;

	// try out all the available moves
	getAvailableMoves().forEach(({ x, y }) => {
		// computer is the maximizing player
		board[x][y] = isMax ? PLAYERS.computer : PLAYERS.human;
		const score = minimax(board, depth + 1, !isMax);
		board[x][y] = '';
		bestScore = isMax ? Math.max(score, bestScore) : Math.min(score, bestScore);
	});

	return bestScore;
}

function humanMove(event) {
	const { offsetX, offsetY } = event;

	const x = offsetX <= size ? 0 : offsetX <= size * 2 ? 1 : 2;
	const y = offsetY <= size ? 0 : offsetY <= size * 2 ? 1 : 2;

	if (!board[x][y]) {
		board[x][y] = PLAYERS.human;
		drawX(x, y);
		checkBoard();

		if (gameRunning) {
			canvas.removeEventListener('click', humanMove);
			setTimeout(() => {
				computerMove();
				if (gameRunning) {
					canvas.addEventListener('click', humanMove);
				}
			}, 500);
		}
	}
}
