// play-garbochess.js		

var g_validMoves = null;
var g_allMoves = [];
var g_Checkmate = false;
var g_Stalemate = false;

var board = new Chessboard('board', {
	position: 'start',
	showNotation: true,
	eventHandlers: {
		onPieceSelected: pieceSelected,
		onMove: pieceMove
	}
});

resetGame();
g_timeout = 10;


function updateGameInfo() {
	var nextPlayer,
	status;
	
	
	nextPlayer = g_toMove ? 'white' : 'black';
	

	if (g_Checkmate === true) {
		status = 'CHECKMATE! Player ' + nextPlayer + ' lost.';
	} else if (g_Stalemate === true) {
		status = 'DRAW!';
	} else {
		status = 'Next player is ' + nextPlayer + '.';

		if (g_inCheck === true) {
			status = 'CHECK! ' + status;				
		}
	}			
	

	$('#info-status').html(status);
	$('#info-fen').html(GetFen());
	//$('#info-pgn').html(chess.pgn());
}

function undoGame() {
	if (g_allMoves.length === 0) {
		return;
	}

	UnmakeMove(g_allMoves[g_allMoves.length - 1]);
	g_allMoves.pop();
	UnmakeMove(g_allMoves[g_allMoves.length - 1]);
	g_allMoves.pop();
	
	g_Checkmate = false;
	g_Stalemate = false;
	
	g_validMoves = GenerateValidMoves();
	
	board.setPosition(GetFen());

	updateGameInfo();
}

function resetGame() {
	ResetGame();
	board.setPosition(ChessUtils.FEN.startId, true);
	updateGameInfo();
	g_Checkmate = false;
	g_Stalemate = false;
}

function pieceMove(move) {
	var i,
	moveFromX = ChessUtils.convertIndexToColumn(ChessUtils.convertNotationSquareToIndex(move.from)),
	moveFromY = ChessUtils.convertIndexToRow(ChessUtils.convertNotationSquareToIndex(move.from)),
	moveToX = ChessUtils.convertIndexToColumn(ChessUtils.convertNotationSquareToIndex(move.to)),
	moveToY = ChessUtils.convertIndexToRow(ChessUtils.convertNotationSquareToIndex(move.to));

	for (i = 0; i < g_validMoves.length; i++) {
		fromX = (g_validMoves[i] & 0xF) - 4;
		fromY = 7 - (((g_validMoves[i] >> 4) & 0xF) - 2);
		toX = ((g_validMoves[i] >> 8) & 0xF) - 4;
		toY = 7 - (((g_validMoves[i] >> 12) & 0xF) - 2);

		if ((moveFromX === fromX) && (moveFromY === fromY) && (moveToX === toX) && (moveToY === toY)) {

			board.enableUserInput(false);

			g_allMoves[g_allMoves.length] = g_validMoves[i];
			MakeMove(g_validMoves[i]);
			
			updateGameInfo('');

			g_validMoves = null;
			
			if (GenerateValidMoves().length === 0) {
				if (g_inCheck) {
					g_Checkmate = true;
				} else {
					g_Stalemate = true;
				}
			} else {
				setTimeout("blackMoves()", 1000);
			}

			return GetFen();
		}
	}
	return false;
}

function blackMoves() {
	Search(function(nextMove) {
		g_allMoves[g_allMoves.length] = nextMove;
		MakeMove(nextMove);				
		
		if (GenerateValidMoves().length === 0) {
			if (g_inCheck) {
				g_Checkmate = true;
			} else {
				g_Stalemate = true;
			}
		}
		
		updateGameInfo();
		
		board.setPosition(GetFen());
		board.enableUserInput(true);
	}, 99, null);			
}

function gcMoveToXY(gcMove) {
	return {
		fromX: (gcMove & 0xF) - 4,
		fromY: 7 - (((gcMove >> 4) & 0xF) - 2),
		toX: ((gcMove >> 8) & 0xF) - 4,
		toY: 7 - (((gcMove >> 12) & 0xF) - 2)
	}
}


function pieceSelected(notationSquare) {
	var i,
	pieceColumn,
	pieceRow,
	fromX,
	fromY,
	toX,
	toY,
	moves,
	movesPosition = [];

	if (g_validMoves === null) {
		g_validMoves = GenerateValidMoves();
	}

	pieceColumn = ChessUtils.convertIndexToColumn(ChessUtils.convertNotationSquareToIndex(notationSquare));
	pieceRow = ChessUtils.convertIndexToRow(ChessUtils.convertNotationSquareToIndex(notationSquare));

	for (i = 0; i < g_validMoves.length; i++) {
		fromX = gcMoveToXY(g_validMoves[i]).fromX;
		fromY = gcMoveToXY(g_validMoves[i]).fromY;
		toX =  gcMoveToXY(g_validMoves[i]).toX;
		toY = gcMoveToXY(g_validMoves[i]).toY;

		if ((pieceColumn === fromX) && (pieceRow === fromY)) {
			movesPosition.push(ChessUtils.convertRowColumnToIndex(toY, toX));
		}

	}
	return movesPosition;
}

//$(document).ready(prettyPrintPrepare);

