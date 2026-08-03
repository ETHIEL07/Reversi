namespace Reversi.Core;

/// <summary>
/// Positional reading of a board: which discs are locked for good, and which ones the
/// side to move can still turn over. Pure, like the rest of Core.
/// </summary>
public static class BoardAnalyzer
{
    /// <summary>The four axes a disc must be secured on to be stable: row, column, both diagonals.</summary>
    private static readonly (int RowStep, int ColStep)[] Axes =
    [
        (0, 1),
        (1, 0),
        (1, 1),
        (1, -1),
    ];

    public static BoardAnalysis Analyze(Board board, Player playerToMove)
    {
        ArgumentNullException.ThrowIfNull(board);

        var stable = ComputeStability(board);
        var atRisk = ComputeDiscsAtRisk(board, playerToMove);

        var cells = new List<CellAnalysis>();
        var stableBlack = 0;
        var stableWhite = 0;
        var atRiskBlack = 0;
        var atRiskWhite = 0;

        foreach (var position in Board.AllPositions())
        {
            var state = board[position];

            if (state == CellState.Empty)
            {
                continue;
            }

            var isStable = stable[position.Row, position.Col];
            var isAtRisk = atRisk.Contains(position);

            if (isStable)
            {
                if (state == CellState.Black)
                {
                    stableBlack++;
                }
                else
                {
                    stableWhite++;
                }
            }

            if (isAtRisk)
            {
                if (state == CellState.Black)
                {
                    atRiskBlack++;
                }
                else
                {
                    atRiskWhite++;
                }
            }

            cells.Add(new CellAnalysis(position, state, position.IsCorner, isStable, isAtRisk));
        }

        return new BoardAnalysis(cells, stableBlack, stableWhite, atRiskBlack, atRiskWhite);
    }

    /// <summary>
    /// A disc is stable when, on each of the four axes, it is either part of a completely
    /// filled line or backed all the way to an edge by stable discs of its own colour.
    /// Corners satisfy this immediately, and stability then propagates along the edges.
    /// </summary>
    public static bool[,] ComputeStability(Board board)
    {
        ArgumentNullException.ThrowIfNull(board);

        var stableOnAxis = new bool[Board.Size, Board.Size, Axes.Length];
        var lineIsFull = new bool[Board.Size, Board.Size, Axes.Length];

        for (var axis = 0; axis < Axes.Length; axis++)
        {
            var (rowStep, colStep) = Axes[axis];

            foreach (var position in Board.AllPositions())
            {
                lineIsFull[position.Row, position.Col, axis] = IsLineFull(board, position, rowStep, colStep);
            }
        }

        bool changed;

        do
        {
            changed = false;

            foreach (var position in Board.AllPositions())
            {
                if (board[position] == CellState.Empty)
                {
                    continue;
                }

                for (var axis = 0; axis < Axes.Length; axis++)
                {
                    if (stableOnAxis[position.Row, position.Col, axis])
                    {
                        continue;
                    }

                    var (rowStep, colStep) = Axes[axis];

                    var secured = lineIsFull[position.Row, position.Col, axis]
                        || IsBackedToEdge(board, stableOnAxis, position, rowStep, colStep, axis)
                        || IsBackedToEdge(board, stableOnAxis, position, -rowStep, -colStep, axis);

                    if (secured)
                    {
                        stableOnAxis[position.Row, position.Col, axis] = true;
                        changed = true;
                    }
                }
            }
        }
        while (changed);

        var stable = new bool[Board.Size, Board.Size];

        foreach (var position in Board.AllPositions())
        {
            if (board[position] == CellState.Empty)
            {
                continue;
            }

            var allAxes = true;

            for (var axis = 0; axis < Axes.Length; axis++)
            {
                if (!stableOnAxis[position.Row, position.Col, axis])
                {
                    allAxes = false;
                    break;
                }
            }

            stable[position.Row, position.Col] = allAxes;
        }

        return stable;
    }

    /// <summary>Every disc the side to move would flip with at least one of its legal moves.</summary>
    public static IReadOnlySet<Position> ComputeDiscsAtRisk(Board board, Player playerToMove)
    {
        ArgumentNullException.ThrowIfNull(board);

        var atRisk = new HashSet<Position>();

        foreach (var move in GameRules.GetLegalMoves(board, playerToMove))
        {
            foreach (var flipped in move.Flips)
            {
                atRisk.Add(flipped);
            }
        }

        return atRisk;
    }

    private static bool IsLineFull(Board board, Position position, int rowStep, int colStep)
    {
        return WalkIsFull(board, position, rowStep, colStep)
            && WalkIsFull(board, position, -rowStep, -colStep);
    }

    private static bool WalkIsFull(Board board, Position position, int rowStep, int colStep)
    {
        var current = new Position(position.Row + rowStep, position.Col + colStep);

        while (current.IsOnBoard)
        {
            if (board[current] == CellState.Empty)
            {
                return false;
            }

            current = new Position(current.Row + rowStep, current.Col + colStep);
        }

        return true;
    }

    private static bool IsBackedToEdge(
        Board board,
        bool[,,] stableOnAxis,
        Position position,
        int rowStep,
        int colStep,
        int axis)
    {
        var neighbour = new Position(position.Row + rowStep, position.Col + colStep);

        if (!neighbour.IsOnBoard)
        {
            return true;
        }

        if (board[neighbour] != board[position])
        {
            return false;
        }

        return stableOnAxis[neighbour.Row, neighbour.Col, axis];
    }
}
