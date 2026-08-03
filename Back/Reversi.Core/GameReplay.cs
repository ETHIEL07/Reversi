namespace Reversi.Core;

/// <summary>
/// Encodes a game as its move list and rebuilds it by replaying from the opening position.
/// The move list is the single source of truth: it gives undo and the move timeline for free.
/// </summary>
public static class GameReplay
{
    /// <summary>Token recorded for a forfeited turn.</summary>
    public const string PassToken = "--";

    private const char Separator = ',';

    public static string Encode(Game game)
    {
        ArgumentNullException.ThrowIfNull(game);

        return string.Join(Separator, game.History.Select(move => move.Notation));
    }

    public static Game Decode(string? movesCsv)
    {
        var game = new Game();

        if (string.IsNullOrWhiteSpace(movesCsv))
        {
            return game;
        }

        foreach (var token in movesCsv.Split(Separator, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            if (token == PassToken)
            {
                game.Pass();
                continue;
            }

            game.Play(Position.FromNotation(token));
        }

        return game;
    }
}
