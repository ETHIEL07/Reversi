using Reversi.Core;

namespace Reversi.Tests;

[TestFixture]
public class BoardAnalyzerTests
{
    private static CellAnalysis CellAt(BoardAnalysis analysis, string notation)
    {
        var position = Position.FromNotation(notation);
        return analysis.Cells.Single(cell => cell.Position == position);
    }

    [Test]
    public void ACornerDiscIsAlwaysStable()
    {
        var board = Board.Parse(
            "B.......",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........");

        var analysis = BoardAnalyzer.Analyze(board, Player.White);
        var corner = CellAt(analysis, "a1");

        Assert.Multiple(() =>
        {
            Assert.That(corner.IsCorner, Is.True);
            Assert.That(corner.IsStable, Is.True);
            Assert.That(analysis.StableBlack, Is.EqualTo(1));
        });
    }

    [Test]
    public void AFullEdgeIsStableAlongItsWholeLength()
    {
        var board = Board.Parse(
            "BBBBBBBB",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........");

        var analysis = BoardAnalyzer.Analyze(board, Player.White);

        Assert.Multiple(() =>
        {
            Assert.That(analysis.StableBlack, Is.EqualTo(8));
            Assert.That(analysis.Cells.All(cell => cell.IsStable), Is.True);
        });
    }

    [Test]
    public void CentralDiscsOfTheOpeningAreNotStable()
    {
        var analysis = BoardAnalyzer.Analyze(Board.CreateInitial(), Player.Black);

        Assert.Multiple(() =>
        {
            Assert.That(analysis.Cells, Has.Count.EqualTo(4));
            Assert.That(analysis.Cells.Any(cell => cell.IsStable), Is.False);
            Assert.That(analysis.StableBlack, Is.Zero);
            Assert.That(analysis.StableWhite, Is.Zero);
        });
    }

    [Test]
    public void AFullBoardIsEntirelyStable()
    {
        var board = Board.Parse(
            "BBBBBBBB",
            "BBBBBBBB",
            "BBBBBBBB",
            "BBBBBBBB",
            "WWWWWWWW",
            "WWWWWWWW",
            "WWWWWWWW",
            "WWWWWWWW");

        var analysis = BoardAnalyzer.Analyze(board, Player.Black);

        Assert.Multiple(() =>
        {
            Assert.That(analysis.StableBlack, Is.EqualTo(32));
            Assert.That(analysis.StableWhite, Is.EqualTo(32));
        });
    }

    [Test]
    public void OnlyTheOpponentDiscsAreAtRiskFromTheSideToMove()
    {
        var analysis = BoardAnalyzer.Analyze(Board.CreateInitial(), Player.Black);

        Assert.Multiple(() =>
        {
            Assert.That(analysis.AtRiskWhite, Is.GreaterThan(0));
            Assert.That(analysis.AtRiskBlack, Is.Zero);
        });
    }

    [Test]
    public void ADiscIsFlaggedAtRiskWhenALegalMoveWouldFlipIt()
    {
        var analysis = BoardAnalyzer.Analyze(Board.CreateInitial(), Player.Black);

        // Black plays d3 and flips d4, so d4 is threatened right now.
        Assert.That(CellAt(analysis, "d4").IsAtRisk, Is.True);
    }

    [Test]
    public void NothingIsAtRiskWhenTheSideToMoveHasNoLegalMove()
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

        var analysis = BoardAnalyzer.Analyze(board, Player.White);

        Assert.Multiple(() =>
        {
            Assert.That(analysis.AtRiskBlack, Is.Zero);
            Assert.That(analysis.AtRiskWhite, Is.Zero);
        });
    }
}
