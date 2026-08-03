using Reversi.Core;

namespace Reversi.Tests;

[TestFixture]
public class DemoPositionsTests
{
    [Test]
    public void MidGame_IsWellUnderWayAndStillPlayable()
    {
        var game = DemoPositions.Build(DemoPosition.MidGame);

        Assert.Multiple(() =>
        {
            Assert.That(game.IsOver, Is.False);
            Assert.That(game.History, Has.Count.GreaterThanOrEqualTo(20));
            Assert.That(game.Score.Total, Is.GreaterThan(20).And.LessThan(48));
            Assert.That(game.LegalMoves, Is.Not.Empty);
        });
    }

    [Test]
    public void Endgame_LeavesOnlyAFewEmptySquares()
    {
        var game = DemoPositions.Build(DemoPosition.Endgame);

        Assert.That(game.Score.Total, Is.GreaterThanOrEqualTo(50));
    }

    [Test]
    public void ADemoPositionIsReproducible()
    {
        var first = GameReplay.Encode(DemoPositions.Build(DemoPosition.MidGame));
        var second = GameReplay.Encode(DemoPositions.Build(DemoPosition.MidGame));

        Assert.That(first, Is.EqualTo(second));
    }

    [Test]
    public void ADemoPositionSurvivesAReplay()
    {
        var built = DemoPositions.Build(DemoPosition.MidGame);
        var replayed = GameReplay.Decode(GameReplay.Encode(built));

        Assert.Multiple(() =>
        {
            Assert.That(replayed.Board.HasSameCellsAs(built.Board), Is.True);
            Assert.That(replayed.CurrentPlayer, Is.EqualTo(built.CurrentPlayer));
            Assert.That(replayed.Score, Is.EqualTo(built.Score));
        });
    }

    [Test]
    public void AnUnknownPositionIsRejected()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => DemoPositions.Build((DemoPosition)99));
    }
}
