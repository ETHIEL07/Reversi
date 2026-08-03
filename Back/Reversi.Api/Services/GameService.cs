using Microsoft.EntityFrameworkCore;
using Reversi.Core;
using Reversi.Core.Ai;
using Reversi.Data;

namespace Reversi.Api.Services;

/// <summary>
/// Bridges the pure engine and storage. The move list is persisted and the board is rebuilt
/// by replay, so a game is always exactly what its moves say it is.
/// </summary>
public sealed class GameService(ReversiDbContext db)
{
    public async Task<GameRecord> CreateAsync(
        OpponentKind opponent,
        AiLevel? level,
        Player humanColor,
        CancellationToken cancellationToken)
    {
        var game = new Game();
        var now = DateTime.UtcNow;

        var record = new GameRecord
        {
            Id = Guid.NewGuid(),
            CreatedAt = now,
            UpdatedAt = now,
            Opponent = opponent,
            Level = opponent == OpponentKind.Computer ? level : null,
            HumanColor = humanColor,
        };

        // Black opens: when the human takes white, the computer plays the first move.
        AdvanceComputer(record, game);

        Sync(record, game);

        db.Games.Add(record);
        await db.SaveChangesAsync(cancellationToken);

        return record;
    }

    public Task<GameRecord?> FindAsync(Guid id, CancellationToken cancellationToken) =>
        db.Games.FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

    /// <summary>Rebuilds the engine state by replaying the persisted move list.</summary>
    public static Game Rebuild(GameRecord record)
    {
        ArgumentNullException.ThrowIfNull(record);

        return GameReplay.Decode(record.MovesCsv);
    }

    public async Task SaveAsync(GameRecord record, Game game, CancellationToken cancellationToken)
    {
        Sync(record, game);
        record.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<GameRecord> Items, int Total)> ListAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var total = await db.Games.CountAsync(cancellationToken);

        var items = await db.Games
            .OrderByDescending(record => record.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    /// <summary>
    /// Lets the computer play its replies, if this game has one. Does nothing on a
    /// two-player game or when the human is on move.
    /// </summary>
    public static void AdvanceComputer(GameRecord record, Game game)
    {
        ArgumentNullException.ThrowIfNull(record);
        ArgumentNullException.ThrowIfNull(game);

        if (record.Opponent != OpponentKind.Computer || record.Level is not { } level)
        {
            return;
        }

        AiTurn.Advance(game, record.HumanColor.Opponent(), level);
    }

    /// <summary>Copies the engine state onto the record, including the denormalised columns.</summary>
    private static void Sync(GameRecord record, Game game)
    {
        var score = game.Score;

        record.MovesCsv = GameReplay.Encode(game);
        record.MoveCount = game.History.Count;
        record.CurrentPlayer = game.CurrentPlayer;
        record.Status = game.Status;
        record.BlackScore = score.Black;
        record.WhiteScore = score.White;
    }
}
