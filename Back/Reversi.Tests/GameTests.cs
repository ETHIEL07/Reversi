using Reversi.Core;

namespace Reversi.Tests;

[TestFixture]
public class GameTests
{
    /// <summary>
    /// White has no way to outflank a black disc here, while black can still play d3.
    /// Used for the forfeited turn scenarios.
    /// </summary>
    private static Board BoardWhereWhiteCannotMove() => Board.Parse(
        "BBB.....",
        "..W.....",
        "........",
        "........",
        "........",
        "........",
        "........",
        "........");

    [Test]
    public void NewGame_StartsWithBlackToMove()
    {
        var game = new Game();

        Assert.Multiple(() =>
        {
            Assert.That(game.CurrentPlayer, Is.EqualTo(Player.Black));
            Assert.That(game.Score, Is.EqualTo(new Score(2, 2)));
            Assert.That(game.LegalMoves, Has.Count.EqualTo(4));
            Assert.That(game.Status, Is.EqualTo(GameStatus.InProgress));
            Assert.That(game.MustPass, Is.False);
            Assert.That(game.CanUndo, Is.False);
            Assert.That(game.History, Is.Empty);
        });
    }

    [Test]
    public void Play_UpdatesBoardScoreAndHandsOverTheTurn()
    {
        var game = new Game();

        game.Play(Position.FromNotation("d3"));

        Assert.Multiple(() =>
        {
            Assert.That(game.CurrentPlayer, Is.EqualTo(Player.White));
            Assert.That(game.Score, Is.EqualTo(new Score(4, 1)));
            Assert.That(game.History, Has.Count.EqualTo(1));
            Assert.That(game.History[0].Notation, Is.EqualTo("d3"));
            Assert.That(game.History[0].Player, Is.EqualTo(Player.Black));
            Assert.That(game.History[0].IsPass, Is.False);
        });
    }

    [Test]
    public void Play_RejectsAnIllegalSquare()
    {
        var game = new Game();

        Assert.Throws<IllegalMoveException>(() => game.Play(Position.FromNotation("a1")));
        Assert.That(game.History, Is.Empty);
    }

    [Test]
    public void MustPass_IsTrueWhenTheSideToMoveHasNoLegalMove()
    {
        var game = new Game(BoardWhereWhiteCannotMove(), Player.White);

        Assert.Multiple(() =>
        {
            Assert.That(game.LegalMoves, Is.Empty);
            Assert.That(game.IsOver, Is.False);
            Assert.That(game.MustPass, Is.True);
        });
    }

    [Test]
    public void Pass_HandsOverTheTurnAndIsRecordedInTheHistory()
    {
        var game = new Game(BoardWhereWhiteCannotMove(), Player.White);

        game.Pass();

        Assert.Multiple(() =>
        {
            Assert.That(game.CurrentPlayer, Is.EqualTo(Player.Black));
            Assert.That(game.History, Has.Count.EqualTo(1));
            Assert.That(game.History[0].IsPass, Is.True);
            Assert.That(game.History[0].Notation, Is.EqualTo("--"));
        });
    }

    [Test]
    public void Pass_IsForbiddenWhenALegalMoveIsAvailable()
    {
        var game = new Game();

        Assert.Throws<InvalidOperationException>(() => game.Pass());
    }

    [Test]
    public void Play_IsForbiddenWhenTheTurnMustBeForfeited()
    {
        var game = new Game(BoardWhereWhiteCannotMove(), Player.White);

        Assert.Throws<IllegalMoveException>(() => game.Play(Position.FromNotation("d1")));
    }

    [Test]
    public void Undo_RestoresTheExactPreviousBoardAndTurn()
    {
        var game = new Game();
        var before = game.Board.Clone();

        game.Play(Position.FromNotation("d3"));
        game.Undo();

        Assert.Multiple(() =>
        {
            Assert.That(game.Board.HasSameCellsAs(before), Is.True);
            Assert.That(game.CurrentPlayer, Is.EqualTo(Player.Black));
            Assert.That(game.History, Is.Empty);
            Assert.That(game.CanUndo, Is.False);
            Assert.That(game.Score, Is.EqualTo(new Score(2, 2)));
        });
    }

    [Test]
    public void Undo_UnwindsSeveralMovesInOrder()
    {
        var game = new Game();
        var initial = game.Board.Clone();

        game.Play(Position.FromNotation("d3"));
        var afterFirst = game.Board.Clone();
        game.Play(Position.FromNotation("c3"));

        game.Undo();
        Assert.That(game.Board.HasSameCellsAs(afterFirst), Is.True);

        game.Undo();
        Assert.Multiple(() =>
        {
            Assert.That(game.Board.HasSameCellsAs(initial), Is.True);
            Assert.That(game.CurrentPlayer, Is.EqualTo(Player.Black));
        });
    }

    [Test]
    public void Undo_RevertsAForfeitedTurnToo()
    {
        var game = new Game(BoardWhereWhiteCannotMove(), Player.White);

        game.Pass();
        game.Undo();

        Assert.Multiple(() =>
        {
            Assert.That(game.CurrentPlayer, Is.EqualTo(Player.White));
            Assert.That(game.History, Is.Empty);
        });
    }

    [Test]
    public void Undo_ThrowsWhenThereIsNothingToUndo()
    {
        var game = new Game();

        Assert.Throws<InvalidOperationException>(() => game.Undo());
    }

    [Test]
    public void FullGame_TerminatesWithAConsistentScore()
    {
        var game = new Game();
        var safety = 0;

        while (!game.IsOver && safety++ < 200)
        {
            if (game.MustPass)
            {
                game.Pass();
                continue;
            }

            // Deterministic policy: always the first legal square, engine coverage only.
            game.Play(game.LegalMoves[0].Position);
        }

        var score = game.Score;

        Assert.Multiple(() =>
        {
            Assert.That(game.IsOver, Is.True, "the game should end on its own");
            Assert.That(safety, Is.LessThan(200), "no infinite loop");
            Assert.That(score.Total, Is.GreaterThan(4).And.LessThanOrEqualTo(64));
            Assert.That(game.Status, Is.Not.EqualTo(GameStatus.InProgress));
            Assert.That(game.History, Is.Not.Empty);
        });
    }
}
