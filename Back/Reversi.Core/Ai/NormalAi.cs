namespace Reversi.Core.Ai;

/// <summary>
/// Greedy: takes the square that flips the most discs, corners breaking ties.
/// Grabbing discs early is a known weakness, which keeps this level reachable.
/// </summary>
public sealed class NormalAi : IAiEngine
{
    public AiLevel Level => AiLevel.Normal;

    public Position ChooseMove(Board board, Player player)
    {
        var moves = GameRules.GetLegalMoves(board, player);

        if (moves.Count == 0)
        {
            throw new InvalidOperationException($"{player} has no legal move, the engine must not be asked to play.");
        }

        return moves
            .OrderByDescending(move => move.FlipCount)
            .ThenByDescending(move => move.Position.IsCorner)
            .ThenBy(move => move.Position.Row)
            .ThenBy(move => move.Position.Col)
            .First()
            .Position;
    }
}
