namespace Reversi.Core.Ai;

/// <summary>
/// Classic Othello square values. Corners are worth taking, the squares next to them are
/// traps because they hand the corner over.
/// </summary>
public static class PositionWeights
{
    public static readonly int[,] Values =
    {
        { 120, -20, 20, 5, 5, 20, -20, 120 },
        { -20, -40, -5, -5, -5, -5, -40, -20 },
        { 20, -5, 15, 3, 3, 15, -5, 20 },
        { 5, -5, 3, 3, 3, 3, -5, 5 },
        { 5, -5, 3, 3, 3, 3, -5, 5 },
        { 20, -5, 15, 3, 3, 15, -5, 20 },
        { -20, -40, -5, -5, -5, -5, -40, -20 },
        { 120, -20, 20, 5, 5, 20, -20, 120 },
    };

    public static int Of(Position position) => Values[position.Row, position.Col];
}
