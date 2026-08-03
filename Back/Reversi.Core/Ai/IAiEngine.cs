namespace Reversi.Core.Ai;

/// <summary>
/// An engine picks one square among the legal moves. It never returns an illegal square,
/// and it is never asked to move when no legal move exists.
/// </summary>
public interface IAiEngine
{
    AiLevel Level { get; }

    Position ChooseMove(Board board, Player player);
}
