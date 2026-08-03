namespace Reversi.Core;

/// <summary>An 8x8 Othello board. Mutable, cloned whenever a snapshot is needed.</summary>
public sealed class Board
{
    public const int Size = 8;

    private readonly CellState[,] cells;

    public Board()
    {
        cells = new CellState[Size, Size];
    }

    private Board(CellState[,] source)
    {
        cells = (CellState[,])source.Clone();
    }

    /// <summary>
    /// Official starting position: the four central squares occupied in a fixed diagonal
    /// pattern, black on d5 and e4, white on d4 and e5.
    /// </summary>
    public static Board CreateInitial()
    {
        var board = new Board();
        board[3, 3] = CellState.White;
        board[3, 4] = CellState.Black;
        board[4, 3] = CellState.Black;
        board[4, 4] = CellState.White;
        return board;
    }

    public CellState this[int row, int col]
    {
        get => cells[row, col];
        set => cells[row, col] = value;
    }

    public CellState this[Position position]
    {
        get => cells[position.Row, position.Col];
        set => cells[position.Row, position.Col] = value;
    }

    public Board Clone() => new(cells);

    public int Count(CellState state)
    {
        var total = 0;

        for (var row = 0; row < Size; row++)
        {
            for (var col = 0; col < Size; col++)
            {
                if (cells[row, col] == state)
                {
                    total++;
                }
            }
        }

        return total;
    }

    public bool IsFull() => Count(CellState.Empty) == 0;

    public static IEnumerable<Position> AllPositions()
    {
        for (var row = 0; row < Size; row++)
        {
            for (var col = 0; col < Size; col++)
            {
                yield return new Position(row, col);
            }
        }
    }

    /// <summary>Value equality on the squares, used by the undo tests.</summary>
    public bool HasSameCellsAs(Board other)
    {
        ArgumentNullException.ThrowIfNull(other);

        for (var row = 0; row < Size; row++)
        {
            for (var col = 0; col < Size; col++)
            {
                if (cells[row, col] != other.cells[row, col])
                {
                    return false;
                }
            }
        }

        return true;
    }

    /// <summary>
    /// Renders the board as eight rows of eight characters, the inverse of <see cref="Parse"/>.
    /// This is what the API sends to the front: compact, and readable in Swagger.
    /// </summary>
    public string[] ToRows()
    {
        var rows = new string[Size];

        for (var row = 0; row < Size; row++)
        {
            var chars = new char[Size];

            for (var col = 0; col < Size; col++)
            {
                chars[col] = cells[row, col] switch
                {
                    CellState.Black => 'B',
                    CellState.White => 'W',
                    _ => '.',
                };
            }

            rows[row] = new string(chars);
        }

        return rows;
    }

    /// <summary>
    /// Builds a board from eight rows of eight characters: '.' empty, 'B' black, 'W' white.
    /// Row 0 of the array is rank 1. Used by the tests to express positions readably.
    /// </summary>
    public static Board Parse(params string[] rows)
    {
        ArgumentNullException.ThrowIfNull(rows);

        if (rows.Length != Size)
        {
            throw new ArgumentException($"Expected {Size} rows, got {rows.Length}.", nameof(rows));
        }

        var board = new Board();

        for (var row = 0; row < Size; row++)
        {
            var line = rows[row];

            if (line.Length != Size)
            {
                throw new ArgumentException($"Row {row} has {line.Length} characters, expected {Size}.", nameof(rows));
            }

            for (var col = 0; col < Size; col++)
            {
                board[row, col] = line[col] switch
                {
                    '.' => CellState.Empty,
                    'B' or 'b' => CellState.Black,
                    'W' or 'w' => CellState.White,
                    _ => throw new ArgumentException($"Unexpected character '{line[col]}' at row {row}, column {col}.", nameof(rows)),
                };
            }
        }

        return board;
    }
}
