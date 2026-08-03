namespace Reversi.Core;

/// <summary>
/// One entry of the game history. A forfeited turn is recorded too, with a null position,
/// so the move list can be replayed and displayed faithfully.
/// </summary>
/// <param name="Number">1-based index in the history.</param>
/// <param name="Player">Side that acted.</param>
/// <param name="Position">Square played, null when the turn was forfeited.</param>
/// <param name="Flips">Discs flipped by the move, empty on a forfeited turn.</param>
public sealed record PlayedMove(
    int Number,
    Player Player,
    Position? Position,
    IReadOnlyList<Position> Flips)
{
    public bool IsPass => Position is null;

    public string Notation => Position?.Notation ?? "--";
}
