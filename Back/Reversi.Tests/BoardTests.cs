using Reversi.Core;

namespace Reversi.Tests;

[TestFixture]
public class BoardTests
{
    [Test]
    public void CreateInitial_PlacesFourDiscsOnTheCentreDiagonals()
    {
        var board = Board.CreateInitial();

        Assert.Multiple(() =>
        {
            Assert.That(board[Position.FromNotation("d4")], Is.EqualTo(CellState.White));
            Assert.That(board[Position.FromNotation("e5")], Is.EqualTo(CellState.White));
            Assert.That(board[Position.FromNotation("e4")], Is.EqualTo(CellState.Black));
            Assert.That(board[Position.FromNotation("d5")], Is.EqualTo(CellState.Black));
            Assert.That(board.Count(CellState.Black), Is.EqualTo(2));
            Assert.That(board.Count(CellState.White), Is.EqualTo(2));
            Assert.That(board.Count(CellState.Empty), Is.EqualTo(60));
        });
    }

    [Test]
    public void Clone_DoesNotShareStorageWithTheOriginal()
    {
        var board = Board.CreateInitial();
        var clone = board.Clone();

        clone[0, 0] = CellState.Black;

        Assert.Multiple(() =>
        {
            Assert.That(board[0, 0], Is.EqualTo(CellState.Empty));
            Assert.That(board.HasSameCellsAs(clone), Is.False);
        });
    }

    [Test]
    public void Parse_ReadsRowsFromRankOneUpwards()
    {
        var board = Board.Parse(
            "BW......",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........");

        Assert.Multiple(() =>
        {
            Assert.That(board[0, 0], Is.EqualTo(CellState.Black));
            Assert.That(board[0, 1], Is.EqualTo(CellState.White));
            Assert.That(board[0, 2], Is.EqualTo(CellState.Empty));
        });
    }

    [Test]
    public void IsFull_IsTrueOnlyWhenNoSquareIsEmpty()
    {
        Assert.That(Board.CreateInitial().IsFull(), Is.False);

        var full = Board.Parse(
            "BBBBBBBB",
            "BBBBBBBB",
            "BBBBBBBB",
            "BBBBBBBB",
            "WWWWWWWW",
            "WWWWWWWW",
            "WWWWWWWW",
            "WWWWWWWW");

        Assert.That(full.IsFull(), Is.True);
    }
}
