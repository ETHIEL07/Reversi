using Reversi.Core;

namespace Reversi.Tests;

[TestFixture]
public class GameRulesTests
{
    [Test]
    public void InitialPosition_GivesBlackExactlyFourLegalMoves()
    {
        var board = Board.CreateInitial();

        var moves = GameRules.GetLegalMoves(board, Player.Black);
        var notations = moves.Select(move => move.Position.Notation).OrderBy(n => n).ToArray();

        Assert.Multiple(() =>
        {
            Assert.That(moves, Has.Count.EqualTo(4));
            Assert.That(notations, Is.EqualTo(new[] { "c4", "d3", "e6", "f5" }));
            Assert.That(moves.All(move => move.FlipCount == 1), Is.True);
        });
    }

    [Test]
    public void InitialPosition_GivesWhiteFourLegalMovesToo()
    {
        var moves = GameRules.GetLegalMoves(Board.CreateInitial(), Player.White);

        Assert.That(moves, Has.Count.EqualTo(4));
    }

    [Test]
    public void GetFlips_OutflanksInAllEightDirections()
    {
        // Black plays d4: one white disc is outflanked on each of the eight lines.
        var board = Board.Parse(
            "........",
            ".B.B.B..",
            "..WWW...",
            ".BW.WB..",
            "..WWW...",
            ".B.B.B..",
            "........",
            "........");

        var flips = GameRules.GetFlips(board, Player.Black, new Position(3, 3));

        Assert.That(flips, Has.Count.EqualTo(8));
    }

    [Test]
    public void ApplyMove_FlipsAlongEveryOutflankedLineAtOnce()
    {
        // Black plays c4: flips d4 horizontally and d5 diagonally.
        var board = Board.Parse(
            "........",
            "........",
            "........",
            "...WB...",
            "...W....",
            "....B...",
            "........",
            "........");

        var flips = GameRules.ApplyMove(board, Player.Black, new Position(3, 2));

        Assert.Multiple(() =>
        {
            Assert.That(flips, Has.Count.EqualTo(2));
            Assert.That(board[3, 2], Is.EqualTo(CellState.Black));
            Assert.That(board[3, 3], Is.EqualTo(CellState.Black));
            Assert.That(board[4, 3], Is.EqualTo(CellState.Black));
            Assert.That(board[5, 4], Is.EqualTo(CellState.Black));
        });
    }

    [Test]
    public void GetFlips_StopsAtAnEmptySquareInsteadOfWrappingAround()
    {
        var board = Board.Parse(
            "........",
            "........",
            "........",
            "..W.WB..",
            "........",
            "........",
            "........",
            "........");

        // d4 is empty, so the line from c4 is not closed by a black disc.
        Assert.That(GameRules.GetFlips(board, Player.Black, new Position(3, 1)), Is.Empty);
    }

    [Test]
    public void GetFlips_RejectsAnOccupiedSquare()
    {
        var board = Board.CreateInitial();

        Assert.That(GameRules.GetFlips(board, Player.Black, Position.FromNotation("d4")), Is.Empty);
    }

    [Test]
    public void GetFlips_RejectsASquareOutsideTheBoard()
    {
        var board = Board.CreateInitial();

        Assert.That(GameRules.GetFlips(board, Player.Black, new Position(-1, 4)), Is.Empty);
    }

    [Test]
    public void GetFlips_RejectsASquareThatOutflanksNothing()
    {
        var board = Board.CreateInitial();

        Assert.That(GameRules.GetFlips(board, Player.Black, Position.FromNotation("a1")), Is.Empty);
    }

    [Test]
    public void ApplyMove_ThrowsWithAUsableReasonOnAnIllegalSquare()
    {
        var board = Board.CreateInitial();

        var exception = Assert.Throws<IllegalMoveException>(
            () => GameRules.ApplyMove(board, Player.Black, Position.FromNotation("a1")));

        Assert.Multiple(() =>
        {
            Assert.That(exception!.Position.Notation, Is.EqualTo("a1"));
            Assert.That(exception.Player, Is.EqualTo(Player.Black));
            Assert.That(exception.Reason, Is.Not.Empty);
        });
    }

    [Test]
    public void IsGameOver_IsTrueWhenNeitherSideCanMoveEvenWithEmptySquaresLeft()
    {
        var board = Board.Parse(
            "BBB.....",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........");

        Assert.Multiple(() =>
        {
            Assert.That(board.IsFull(), Is.False);
            Assert.That(GameRules.IsGameOver(board), Is.True);
            Assert.That(GameRules.GetStatus(board), Is.EqualTo(GameStatus.BlackWins));
        });
    }

    [Test]
    public void IsGameOver_IsFalseWhileOneSideStillHasAMove()
    {
        Assert.That(GameRules.IsGameOver(Board.CreateInitial()), Is.False);
    }

    [Test]
    public void GetScore_CountsVisibleDiscs()
    {
        var score = GameRules.GetScore(Board.CreateInitial());

        Assert.Multiple(() =>
        {
            Assert.That(score.Black, Is.EqualTo(2));
            Assert.That(score.White, Is.EqualTo(2));
            Assert.That(score.Total, Is.EqualTo(4));
        });
    }

    [Test]
    public void GetStatus_ReportsADrawOnEqualCounts()
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

        Assert.Multiple(() =>
        {
            Assert.That(GameRules.GetStatus(board), Is.EqualTo(GameStatus.Draw));
            Assert.That(GameRules.GetScore(board), Is.EqualTo(new Score(32, 32)));
        });
    }

    [Test]
    public void GetStatus_ReportsWhiteWhenWhiteLeads()
    {
        var board = Board.Parse(
            "WWW.....",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........");

        Assert.That(GameRules.GetStatus(board), Is.EqualTo(GameStatus.WhiteWins));
    }
}
