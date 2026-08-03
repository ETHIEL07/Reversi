using System.Diagnostics;
using Reversi.Core;
using Reversi.Core.Ai;

namespace Reversi.Tests;

[TestFixture]
public class AiTests
{
    private static readonly AiLevel[] AllLevels = [AiLevel.Beginner, AiLevel.Normal, AiLevel.Strong];

    /// <summary>
    /// Black can take a1, or grab three discs on the fourth rank. The corner is worth far more
    /// than the discs, and a strong engine has to see it.
    /// </summary>
    private static Board BoardWithAnAvailableCorner() => Board.Parse(
        ".WB.....",
        "........",
        "........",
        "...WWWB.",
        "........",
        "........",
        "........",
        "........");

    [TestCaseSource(nameof(AllLevels))]
    public void AnEngineNeverReturnsAnIllegalMove(AiLevel level)
    {
        var engine = AiEngineFactory.Create(level, seed: 1234);
        var game = new Game();
        var safety = 0;

        while (!game.IsOver && safety++ < 200)
        {
            if (game.MustPass)
            {
                game.Pass();
                continue;
            }

            var chosen = engine.ChooseMove(game.Board, game.CurrentPlayer);

            Assert.That(
                GameRules.IsLegal(game.Board, game.CurrentPlayer, chosen),
                Is.True,
                $"{level} returned the illegal square {chosen.Notation}");

            // Play throws on an illegal square, so reaching the end is a second guarantee.
            game.Play(chosen);
        }

        Assert.That(game.IsOver, Is.True);
    }

    [Test]
    public void StrongTakesAnAvailableCorner()
    {
        var engine = new StrongAi();

        var chosen = engine.ChooseMove(BoardWithAnAvailableCorner(), Player.Black);

        Assert.Multiple(() =>
        {
            Assert.That(chosen.IsCorner, Is.True, $"expected a corner, got {chosen.Notation}");
            Assert.That(chosen.Notation, Is.EqualTo("a1"));
        });
    }

    [Test]
    public void NormalTakesTheSquareThatFlipsTheMost()
    {
        var engine = new NormalAi();

        var chosen = engine.ChooseMove(BoardWithAnAvailableCorner(), Player.Black);

        Assert.That(chosen.Notation, Is.EqualTo("c4"), "the greedy level goes for the three discs");
    }

    [Test]
    public void BeginnerIsReproducibleWithASeed()
    {
        var first = new BeginnerAi(seed: 7).ChooseMove(Board.CreateInitial(), Player.Black);
        var second = new BeginnerAi(seed: 7).ChooseMove(Board.CreateInitial(), Player.Black);

        Assert.That(first, Is.EqualTo(second));
    }

    [Test]
    public void AnEngineRefusesToPlayWhenNoMoveExists()
    {
        var board = Board.Parse(
            "BBB.....",
            "..W.....",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........");

        foreach (var level in AllLevels)
        {
            var engine = AiEngineFactory.Create(level, seed: 1);

            Assert.Throws<InvalidOperationException>(
                () => engine.ChooseMove(board, Player.White),
                $"{level} should refuse to move when white has none");
        }
    }

    [Test]
    public void StrongBeatsNormalOverAFullGame()
    {
        var game = new Game();
        var strong = new StrongAi(3);
        var normal = new NormalAi();
        var safety = 0;

        // Strong plays black, normal plays white.
        while (!game.IsOver && safety++ < 200)
        {
            if (game.MustPass)
            {
                game.Pass();
                continue;
            }

            var engine = game.CurrentPlayer == Player.Black ? (IAiEngine)strong : normal;
            game.Play(engine.ChooseMove(game.Board, game.CurrentPlayer));
        }

        Assert.That(game.Status, Is.EqualTo(GameStatus.BlackWins), $"final score {game.Score}");
    }

    [Test]
    public void StrongAnswersFastEnoughForAPhone()
    {
        var engine = new StrongAi();
        var game = new Game();

        // A mid-game position has the widest branching, which is the worst case for the search.
        for (var i = 0; i < 20 && !game.IsOver; i++)
        {
            if (game.MustPass)
            {
                game.Pass();
                continue;
            }

            game.Play(game.LegalMoves[0].Position);
        }

        while (game.MustPass)
        {
            game.Pass();
        }

        Assert.That(game.IsOver, Is.False, "the position must still be playable");

        var stopwatch = Stopwatch.StartNew();
        engine.ChooseMove(game.Board, game.CurrentPlayer);
        stopwatch.Stop();

        Assert.That(stopwatch.ElapsedMilliseconds, Is.LessThan(1500), "the reply must feel immediate");
    }

    [Test]
    public void AdvancePlaysUntilTheHumanIsBackOnMove()
    {
        var game = new Game();

        // The human takes white, so the computer opens.
        AiTurn.Advance(game, Player.Black, AiLevel.Normal);

        Assert.Multiple(() =>
        {
            Assert.That(game.History, Has.Count.EqualTo(1));
            Assert.That(game.CurrentPlayer, Is.EqualTo(Player.White));
        });
    }

    [Test]
    public void AdvanceDoesNothingWhenTheHumanIsOnMove()
    {
        var game = new Game();

        AiTurn.Advance(game, Player.White, AiLevel.Normal);

        Assert.That(game.History, Is.Empty);
    }

    [Test]
    public void UndoToHumanTurnRewindsPastTheComputerReply()
    {
        var game = new Game();
        var opening = game.Board.Clone();

        game.Play(Position.FromNotation("d3"));
        AiTurn.Advance(game, Player.White, AiLevel.Normal);

        Assert.That(game.History, Has.Count.EqualTo(2), "the computer should have replied");

        AiTurn.UndoToHumanTurn(game, Player.Black);

        Assert.Multiple(() =>
        {
            Assert.That(game.History, Is.Empty);
            Assert.That(game.CurrentPlayer, Is.EqualTo(Player.Black));
            Assert.That(game.Board.HasSameCellsAs(opening), Is.True);
        });
    }
}
