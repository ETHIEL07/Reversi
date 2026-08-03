namespace Reversi.Core;

/// <summary>Disc count for each side. Always visible above the board in the UI.</summary>
public readonly record struct Score(int Black, int White)
{
    public int Total => Black + White;
}
