namespace Reversi.Core;

/// <summary>
/// A square on the board. Row 0 is rank 1, column 0 is file 'a',
/// so Othello notation "e4" is Row 3, Col 4.
/// </summary>
public readonly record struct Position(int Row, int Col)
{
    public bool IsOnBoard =>
        Row >= 0 && Row < Board.Size && Col >= 0 && Col < Board.Size;

    /// <summary>The four corners can never be flipped, which makes them the strongest squares.</summary>
    public bool IsCorner =>
        (Row == 0 || Row == Board.Size - 1) && (Col == 0 || Col == Board.Size - 1);

    /// <summary>Squares diagonally adjacent to a corner, the classic trap of the opening.</summary>
    public bool IsXSquare =>
        (Row == 1 || Row == Board.Size - 2) && (Col == 1 || Col == Board.Size - 2);

    /// <summary>Standard Othello notation, e.g. "e4".</summary>
    public string Notation => $"{(char)('a' + Col)}{Row + 1}";

    public static Position FromNotation(string notation)
    {
        if (notation is not { Length: 2 })
        {
            throw new ArgumentException($"Invalid notation '{notation}', expected two characters such as 'e4'.", nameof(notation));
        }

        var col = char.ToLowerInvariant(notation[0]) - 'a';
        var row = notation[1] - '1';
        var position = new Position(row, col);

        if (!position.IsOnBoard)
        {
            throw new ArgumentException($"Notation '{notation}' is outside the board.", nameof(notation));
        }

        return position;
    }

    public override string ToString() => Notation;
}
