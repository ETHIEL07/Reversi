namespace Reversi.Core.Ai;

/// <summary>
/// Minimax with alpha-beta pruning over a positional evaluation: square values, mobility,
/// stable discs, and a disc count that only matters near the end. Same family of ideas as the
/// open-source reference engines, at a depth that stays instant on a phone.
/// </summary>
public sealed class StrongAi(int depth = 4) : IAiEngine
{
    private const int WinScore = 1_000_000;
    private const int EndgameEmptySquares = 12;

    private readonly int depth = Math.Max(1, depth);

    public AiLevel Level => AiLevel.Strong;

    public Position ChooseMove(Board board, Player player)
    {
        ArgumentNullException.ThrowIfNull(board);

        var moves = Order(GameRules.GetLegalMoves(board, player));

        if (moves.Count == 0)
        {
            throw new InvalidOperationException($"{player} has no legal move, the engine must not be asked to play.");
        }

        // A corner can never be flipped back, so it is always taken when offered. Restricting
        // the candidates keeps that rule explicit rather than hoping the search agrees.
        var corners = moves.Where(move => move.Position.IsCorner).ToList();

        if (corners.Count > 0)
        {
            moves = corners;
        }

        var best = moves[0].Position;
        var bestScore = int.MinValue;
        var alpha = int.MinValue;

        foreach (var move in moves)
        {
            var next = board.Clone();
            GameRules.ApplyMove(next, player, move.Position);

            var score = Search(next, player, player.Opponent(), depth - 1, alpha, int.MaxValue);

            if (score > bestScore)
            {
                bestScore = score;
                best = move.Position;
            }

            alpha = Math.Max(alpha, bestScore);
        }

        return best;
    }

    private int Search(Board board, Player perspective, Player toMove, int depth, int alpha, int beta)
    {
        if (depth <= 0)
        {
            return Evaluate(board, perspective);
        }

        var moves = Order(GameRules.GetLegalMoves(board, toMove));

        if (moves.Count == 0)
        {
            // The turn is forfeited. If neither side can move the game is over.
            if (!GameRules.HasLegalMove(board, toMove.Opponent()))
            {
                return TerminalScore(board, perspective);
            }

            return Search(board, perspective, toMove.Opponent(), depth - 1, alpha, beta);
        }

        var maximizing = toMove == perspective;
        var best = maximizing ? int.MinValue : int.MaxValue;

        foreach (var move in moves)
        {
            var next = board.Clone();
            GameRules.ApplyMove(next, toMove, move.Position);

            var score = Search(next, perspective, toMove.Opponent(), depth - 1, alpha, beta);

            if (maximizing)
            {
                best = Math.Max(best, score);
                alpha = Math.Max(alpha, best);
            }
            else
            {
                best = Math.Min(best, score);
                beta = Math.Min(beta, best);
            }

            if (beta <= alpha)
            {
                break;
            }
        }

        return best;
    }

    /// <summary>Corner-first move ordering, which makes alpha-beta prune much earlier.</summary>
    private static List<LegalMove> Order(IReadOnlyList<LegalMove> moves) =>
        [.. moves.OrderByDescending(move => PositionWeights.Of(move.Position))];

    private static int TerminalScore(Board board, Player perspective)
    {
        var score = GameRules.GetScore(board);
        var own = perspective == Player.Black ? score.Black : score.White;
        var other = perspective == Player.Black ? score.White : score.Black;

        if (own == other)
        {
            return 0;
        }

        return own > other ? WinScore + own - other : -WinScore + own - other;
    }

    private static int Evaluate(Board board, Player perspective)
    {
        var own = perspective.ToCellState();
        var opponentState = perspective.Opponent().ToCellState();

        var positional = 0;
        var ownDiscs = 0;
        var opponentDiscs = 0;

        foreach (var position in Board.AllPositions())
        {
            var cell = board[position];

            if (cell == own)
            {
                positional += PositionWeights.Of(position);
                ownDiscs++;
            }
            else if (cell == opponentState)
            {
                positional -= PositionWeights.Of(position);
                opponentDiscs++;
            }
        }

        var ownMobility = GameRules.CountLegalMoves(board, perspective);
        var opponentMobility = GameRules.CountLegalMoves(board, perspective.Opponent());
        var mobility = 10 * (ownMobility - opponentMobility);

        var stability = 25 * (CountAnchoredDiscs(board, own) - CountAnchoredDiscs(board, opponentState));

        // Disc count is noise in the opening and decisive at the end.
        var empty = board.Count(CellState.Empty);
        var material = empty <= EndgameEmptySquares ? 12 * (ownDiscs - opponentDiscs) : ownDiscs - opponentDiscs;

        return positional + mobility + stability + material;
    }

    /// <summary>
    /// Cheap stability proxy: discs anchored to an occupied corner along an edge can never be
    /// flipped. The full analysis of <see cref="BoardAnalyzer"/> is far too costly to run at
    /// every node of the search, and this captures most of its value.
    /// </summary>
    private static int CountAnchoredDiscs(Board board, CellState colour)
    {
        var last = Board.Size - 1;
        var total = 0;

        total += WalkEdge(board, colour, new Position(0, 0), 0, 1);
        total += WalkEdge(board, colour, new Position(0, 0), 1, 0);
        total += WalkEdge(board, colour, new Position(0, last), 0, -1);
        total += WalkEdge(board, colour, new Position(0, last), 1, 0);
        total += WalkEdge(board, colour, new Position(last, 0), 0, 1);
        total += WalkEdge(board, colour, new Position(last, 0), -1, 0);
        total += WalkEdge(board, colour, new Position(last, last), 0, -1);
        total += WalkEdge(board, colour, new Position(last, last), -1, 0);

        return total;
    }

    private static int WalkEdge(Board board, CellState colour, Position corner, int rowStep, int colStep)
    {
        if (board[corner] != colour)
        {
            return 0;
        }

        var count = 0;
        var current = corner;

        while (current.IsOnBoard && board[current] == colour)
        {
            count++;
            current = new Position(current.Row + rowStep, current.Col + colStep);
        }

        return count;
    }
}
