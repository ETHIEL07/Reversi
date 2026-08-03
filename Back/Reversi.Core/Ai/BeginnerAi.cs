namespace Reversi.Core.Ai;

/// <summary>
/// Picks a legal square at random. Beatable by anyone, which is the point of the level.
/// </summary>
public sealed class BeginnerAi(int? seed = null) : IAiEngine
{
    private readonly Random random = seed is null ? new Random() : new Random(seed.Value);

    public AiLevel Level => AiLevel.Beginner;

    public Position ChooseMove(Board board, Player player)
    {
        var moves = GameRules.GetLegalMoves(board, player);

        if (moves.Count == 0)
        {
            throw new InvalidOperationException($"{player} has no legal move, the engine must not be asked to play.");
        }

        return moves[random.Next(moves.Count)].Position;
    }
}
