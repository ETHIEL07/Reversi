using Reversi.Core.Ai;

namespace Reversi.Core;

/// <summary>
/// Builds the demo positions by replaying a deterministic game between two engines, so a demo
/// position is always a position that could really have happened, and stays compatible with the
/// move list being the single source of truth.
/// </summary>
public static class DemoPositions
{
    private const int MidGamePlies = 24;
    private const int EndgamePlies = 52;

    public static Game Build(DemoPosition position)
    {
        var plies = position switch
        {
            DemoPosition.MidGame => MidGamePlies,
            DemoPosition.Endgame => EndgamePlies,
            _ => throw new ArgumentOutOfRangeException(nameof(position), position, "Unknown demo position."),
        };

        var game = new Game();

        // Strong against greedy keeps the score close and the position realistic.
        var black = new StrongAi(3);
        var white = new NormalAi();

        for (var ply = 0; ply < plies && !game.IsOver; ply++)
        {
            if (game.MustPass)
            {
                game.Pass();
                continue;
            }

            var engine = game.CurrentPlayer == Player.Black ? (IAiEngine)black : white;
            game.Play(engine.ChooseMove(game.Board, game.CurrentPlayer));
        }

        return game;
    }
}
