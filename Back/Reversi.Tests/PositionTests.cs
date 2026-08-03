using Reversi.Core;

namespace Reversi.Tests;

[TestFixture]
public class PositionTests
{
    [Test]
    public void Notation_UsesFileThenRank()
    {
        Assert.Multiple(() =>
        {
            Assert.That(new Position(0, 0).Notation, Is.EqualTo("a1"));
            Assert.That(new Position(3, 4).Notation, Is.EqualTo("e4"));
            Assert.That(new Position(7, 7).Notation, Is.EqualTo("h8"));
        });
    }

    [Test]
    public void FromNotation_RoundTrips()
    {
        Assert.That(Position.FromNotation("e4"), Is.EqualTo(new Position(3, 4)));
        Assert.That(Position.FromNotation("d5"), Is.EqualTo(new Position(4, 3)));
    }

    [Test]
    public void FromNotation_RejectsSquaresOutsideTheBoard()
    {
        Assert.Throws<ArgumentException>(() => Position.FromNotation("j9"));
    }

    [Test]
    public void IsCorner_IsTrueOnlyForTheFourCorners()
    {
        Assert.Multiple(() =>
        {
            Assert.That(new Position(0, 0).IsCorner, Is.True);
            Assert.That(new Position(0, 7).IsCorner, Is.True);
            Assert.That(new Position(7, 0).IsCorner, Is.True);
            Assert.That(new Position(7, 7).IsCorner, Is.True);
            Assert.That(new Position(0, 1).IsCorner, Is.False);
            Assert.That(new Position(3, 3).IsCorner, Is.False);
        });
    }

    [Test]
    public void IsOnBoard_RejectsNegativeAndOversizedCoordinates()
    {
        Assert.Multiple(() =>
        {
            Assert.That(new Position(-1, 0).IsOnBoard, Is.False);
            Assert.That(new Position(0, 8).IsOnBoard, Is.False);
            Assert.That(new Position(7, 7).IsOnBoard, Is.True);
        });
    }
}
