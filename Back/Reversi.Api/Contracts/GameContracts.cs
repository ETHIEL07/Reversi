using Reversi.Core;

namespace Reversi.Api.Contracts;

/// <summary>Disc count, shown above the board at all times.</summary>
public sealed record ScoreDto(int Black, int White);

/// <summary>A playable square and the discs it would flip, in Othello notation.</summary>
public sealed record LegalMoveDto(int Row, int Col, string Notation, IReadOnlyList<string> Flips);

/// <summary>
/// Positional reading of one disc, so the front can render it without computing anything:
/// crowned on a corner, secured when stable, threatened when at risk.
/// </summary>
public sealed record CellAnalysisDto(
    int Row,
    int Col,
    CellState State,
    bool IsCorner,
    bool IsStable,
    bool IsAtRisk);

/// <summary>
/// The move that produced the current board. The front animates from this square: the disc
/// lands there, then the flips ripple outward from it.
/// </summary>
public sealed record LastMoveDto(
    int Row,
    int Col,
    Player Player,
    bool IsPass,
    IReadOnlyList<string> Flips);

/// <summary>One entry of the move timeline.</summary>
public sealed record MoveHistoryEntryDto(
    int Number,
    Player Player,
    string Notation,
    bool IsPass,
    int FlipCount);

/// <summary>Full state of a game. Everything the front needs to draw a turn.</summary>
public sealed record GameStateDto(
    Guid Id,
    IReadOnlyList<string> Board,
    Player CurrentPlayer,
    GameStatus Status,
    ScoreDto Score,
    bool IsOver,
    bool MustPass,
    bool CanUndo,
    int MoveCount,
    OpponentKind Opponent,
    AiLevel? Level,
    Player HumanColor,
    IReadOnlyList<LegalMoveDto> LegalMoves,
    IReadOnlyList<CellAnalysisDto> Analysis,
    LastMoveDto? LastMove);

/// <summary>Row of the paged game list.</summary>
public sealed record GameSummaryDto(
    Guid Id,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    OpponentKind Opponent,
    AiLevel? Level,
    GameStatus Status,
    int MoveCount,
    ScoreDto Score);

/// <summary>Generic paged envelope.</summary>
public sealed record PagedResultDto<T>(IReadOnlyList<T> Items, int Page, int PageSize, int Total)
{
    public int PageCount => PageSize <= 0 ? 0 : (int)Math.Ceiling(Total / (double)PageSize);
}

/// <summary>Error body returned with every 400 and 404. Never an empty response.</summary>
public sealed record ErrorDto(string Message);
