namespace Reversi.Core.Ai;

/// <summary>
/// Drives the computer side of a game: it plays, and forfeits its turn when it has to,
/// until the human is back on move or the game is over.
/// </summary>
public static class AiTurn
{
    /// <summary>Safety net: a game cannot exceed 60 placements plus a handful of forfeited turns.</summary>
    private const int MaxSteps = 80;

    public static void Advance(Game game, Player aiColor, AiLevel level, int? seed = null)
    {
        ArgumentNullException.ThrowIfNull(game);

        var engine = AiEngineFactory.Create(level, seed);
        var steps = 0;

        while (!game.IsOver && game.CurrentPlayer == aiColor && steps++ < MaxSteps)
        {
            if (game.MustPass)
            {
                game.Pass();
                continue;
            }

            game.Play(engine.ChooseMove(game.Board, aiColor));
        }
    }

    /// <summary>
    /// Rewinds past the computer's replies so undo hands the board back to the human
    /// rather than letting the engine replay immediately.
    /// </summary>
    public static void UndoToHumanTurn(Game game, Player humanColor)
    {
        ArgumentNullException.ThrowIfNull(game);

        if (!game.CanUndo)
        {
            throw new InvalidOperationException("Nothing to undo.");
        }

        game.Undo();

        var steps = 0;

        while (game.CanUndo && game.CurrentPlayer != humanColor && steps++ < MaxSteps)
        {
            game.Undo();
        }
    }
}
