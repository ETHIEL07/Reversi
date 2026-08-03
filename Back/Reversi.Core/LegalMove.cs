namespace Reversi.Core;

/// <summary>
/// A playable square together with every disc it would flip.
/// The flip list is never empty: outflanking at least one opposing disc is what makes a move legal.
/// </summary>
public sealed record LegalMove(Position Position, IReadOnlyList<Position> Flips)
{
    public int FlipCount => Flips.Count;
}
