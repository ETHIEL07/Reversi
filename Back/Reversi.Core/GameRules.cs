namespace Reversi.Core;

/// <summary>
/// The rules of Othello, as published by the World Othello Federation.
/// Pure functions over a board: no HTTP, no persistence, no state.
/// </summary>
public static class GameRules
{
    /// <summary>The eight straight lines a move can outflank along.</summary>
    public static readonly (int RowStep, int ColStep)[] Directions =
    [
        (-1, -1), (-1, 0), (-1, 1),
        (0, -1), (0, 1),
        (1, -1), (1, 0), (1, 1),
    ];

    /// <summary>Every square the player may legally play, with the discs each one flips.</summary>
    public static IReadOnlyList<LegalMove> GetLegalMoves(Board board, Player player)
    {
        ArgumentNullException.ThrowIfNull(board);

        var moves = new List<LegalMove>();

        foreach (var position in Board.AllPositions())
        {
            var flips = GetFlips(board, player, position);

            if (flips.Count > 0)
            {
                moves.Add(new LegalMove(position, flips));
            }
        }

        return moves;
    }

    /// <summary>
    /// Discs flipped by playing <paramref name="position"/>. Empty when the move is illegal:
    /// off the board, on an occupied square, or outflanking nothing.
    /// </summary>
    public static IReadOnlyList<Position> GetFlips(Board board, Player player, Position position)
    {
        ArgumentNullException.ThrowIfNull(board);

        if (!position.IsOnBoard || board[position] != CellState.Empty)
        {
            return [];
        }

        var own = player.ToCellState();
        var opponent = player.Opponent().ToCellState();
        var flips = new List<Position>();

        foreach (var (rowStep, colStep) in Directions)
        {
            var line = new List<Position>();
            var current = new Position(position.Row + rowStep, position.Col + colStep);

            while (current.IsOnBoard && board[current] == opponent)
            {
                line.Add(current);
                current = new Position(current.Row + rowStep, current.Col + colStep);
            }

            // The line only counts if it is closed by one of the player's own discs.
            if (line.Count > 0 && current.IsOnBoard && board[current] == own)
            {
                flips.AddRange(line);
            }
        }

        return flips;
    }

    public static bool IsLegal(Board board, Player player, Position position)
    {
        ArgumentNullException.ThrowIfNull(board);

        return WouldFlip(board, player, position);
    }

    public static bool HasLegalMove(Board board, Player player)
    {
        ArgumentNullException.ThrowIfNull(board);

        for (var row = 0; row < Board.Size; row++)
        {
            for (var col = 0; col < Board.Size; col++)
            {
                if (WouldFlip(board, player, new Position(row, col)))
                {
                    return true;
                }
            }
        }

        return false;
    }

    /// <summary>
    /// Number of legal moves, without building the flip lists. Mobility is evaluated at every
    /// node of the search, so this allocation-free variant matters.
    /// </summary>
    public static int CountLegalMoves(Board board, Player player)
    {
        ArgumentNullException.ThrowIfNull(board);

        var total = 0;

        for (var row = 0; row < Board.Size; row++)
        {
            for (var col = 0; col < Board.Size; col++)
            {
                if (WouldFlip(board, player, new Position(row, col)))
                {
                    total++;
                }
            }
        }

        return total;
    }

    /// <summary>Same rule as <see cref="GetFlips"/>, stopping at the first outflanked line.</summary>
    private static bool WouldFlip(Board board, Player player, Position position)
    {
        if (!position.IsOnBoard || board[position] != CellState.Empty)
        {
            return false;
        }

        var own = player.ToCellState();
        var opponent = player.Opponent().ToCellState();

        foreach (var (rowStep, colStep) in Directions)
        {
            var current = new Position(position.Row + rowStep, position.Col + colStep);
            var seen = 0;

            while (current.IsOnBoard && board[current] == opponent)
            {
                seen++;
                current = new Position(current.Row + rowStep, current.Col + colStep);
            }

            if (seen > 0 && current.IsOnBoard && board[current] == own)
            {
                return true;
            }
        }

        return false;
    }

    /// <summary>
    /// Applies a move in place. All outflanked discs are flipped, which is mandatory
    /// even when it is not to the player's advantage.
    /// </summary>
    public static IReadOnlyList<Position> ApplyMove(Board board, Player player, Position position)
    {
        ArgumentNullException.ThrowIfNull(board);

        var flips = GetFlips(board, player, position);

        if (flips.Count == 0)
        {
            throw new IllegalMoveException(position, player, DescribeRejection(board, player, position));
        }

        var own = player.ToCellState();
        board[position] = own;

        foreach (var flipped in flips)
        {
            board[flipped] = own;
        }

        return flips;
    }

    /// <summary>The game is over as soon as neither side can move. The board may still have empty squares.</summary>
    public static bool IsGameOver(Board board) =>
        !HasLegalMove(board, Player.Black) && !HasLegalMove(board, Player.White);

    public static Score GetScore(Board board)
    {
        ArgumentNullException.ThrowIfNull(board);

        return new Score(board.Count(CellState.Black), board.Count(CellState.White));
    }

    public static GameStatus GetStatus(Board board)
    {
        if (!IsGameOver(board))
        {
            return GameStatus.InProgress;
        }

        var score = GetScore(board);

        if (score.Black > score.White)
        {
            return GameStatus.BlackWins;
        }

        return score.White > score.Black ? GameStatus.WhiteWins : GameStatus.Draw;
    }

    /// <summary>Human readable reason, surfaced by the API as a 400 instead of a silent failure.</summary>
    private static string DescribeRejection(Board board, Player player, Position position)
    {
        if (!position.IsOnBoard)
        {
            return "Square is outside the board.";
        }

        if (board[position] != CellState.Empty)
        {
            return "Square is already occupied.";
        }

        return $"Playing {position.Notation} would not outflank any {player.Opponent()} disc.";
    }
}
