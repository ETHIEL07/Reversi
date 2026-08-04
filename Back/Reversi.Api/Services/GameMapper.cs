using Reversi.Api.Contracts;
using Reversi.Core;
using Reversi.Data;

namespace Reversi.Api.Services;

/// <summary>Turns engine objects into the transport shapes consumed by the front.</summary>
public static class GameMapper
{
    public static GameStateDto ToStateDto(GameRecord record, Game game)
    {
        ArgumentNullException.ThrowIfNull(record);
        ArgumentNullException.ThrowIfNull(game);

        var analysis = BoardAnalyzer.Analyze(game.Board, game.CurrentPlayer);

        return new GameStateDto(
            Id: record.Id,
            Board: game.Board.ToRows(),
            CurrentPlayer: game.CurrentPlayer,
            Status: game.Status,
            Score: ToScoreDto(game.Score),
            IsOver: game.IsOver,
            MustPass: game.MustPass,
            CanUndo: game.CanUndo,
            MoveCount: game.History.Count,
            Opponent: record.Opponent,
            Level: record.Level,
            HumanColor: record.HumanColor,
            LegalMoves: game.LegalMoves.Select(ToLegalMoveDto).ToArray(),
            Analysis: analysis.Cells.Select(ToCellAnalysisDto).ToArray(),
            LastMove: ToLastMoveDto(game.History.Count == 0 ? null : game.History[^1]));
    }

    public static LastMoveDto? ToLastMoveDto(PlayedMove? move)
    {
        if (move?.Position is not { } position)
        {
            return null;
        }

        return new LastMoveDto(
            position.Row,
            position.Col,
            move.Player,
            move.IsPass,
            move.Flips.Select(flip => flip.Notation).ToArray());
    }

    public static ScoreDto ToScoreDto(Score score) => new(score.Black, score.White);

    public static LegalMoveDto ToLegalMoveDto(LegalMove move)
    {
        ArgumentNullException.ThrowIfNull(move);

        return new LegalMoveDto(
            move.Position.Row,
            move.Position.Col,
            move.Position.Notation,
            move.Flips.Select(flip => flip.Notation).ToArray());
    }

    public static CellAnalysisDto ToCellAnalysisDto(CellAnalysis cell)
    {
        ArgumentNullException.ThrowIfNull(cell);

        return new CellAnalysisDto(
            cell.Position.Row,
            cell.Position.Col,
            cell.State,
            cell.IsCorner,
            cell.IsStable,
            cell.IsAtRisk);
    }

    public static MoveHistoryEntryDto ToHistoryDto(PlayedMove move)
    {
        ArgumentNullException.ThrowIfNull(move);

        return new MoveHistoryEntryDto(
            move.Number,
            move.Player,
            move.Notation,
            move.IsPass,
            move.Flips.Count);
    }

    public static GameSummaryDto ToSummaryDto(GameRecord record)
    {
        ArgumentNullException.ThrowIfNull(record);

        return new GameSummaryDto(
            record.Id,
            record.CreatedAt,
            record.UpdatedAt,
            record.Opponent,
            record.Level,
            record.Status,
            record.MoveCount,
            new ScoreDto(record.BlackScore, record.WhiteScore));
    }
}
