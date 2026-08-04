using Reversi.Api.Contracts;
using Reversi.Api.Services;
using Reversi.Core;
using Reversi.Core.Ai;

namespace Reversi.Api.Endpoints;

/// <summary>
/// The REST surface of the game. The server is the authority: the front asks for the legal
/// moves and posts a square, it never validates anything and never applies a rule itself.
/// </summary>
public static class GameEndpoints
{
    private const int MaxPageSize = 100;

    public static IEndpointRouteBuilder MapGameEndpoints(this IEndpointRouteBuilder routes)
    {
        ArgumentNullException.ThrowIfNull(routes);

        var group = routes.MapGroup("/api/games").WithTags("Games");

        group.MapPost("/", CreateGame)
            .WithName("CreateGame")
            .WithSummary("Creates a game and returns its opening state")
            .Produces<GameStateDto>(StatusCodes.Status201Created)
            .Produces<ErrorDto>(StatusCodes.Status400BadRequest);

        group.MapGet("/", ListGames)
            .WithName("ListGames")
            .WithSummary("Paged list of games, most recent first")
            .Produces<PagedResultDto<GameSummaryDto>>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", GetGame)
            .WithName("GetGame")
            .WithSummary("Full state: board, side to move, score, status, legal moves, analysis")
            .Produces<GameStateDto>(StatusCodes.Status200OK)
            .Produces<ErrorDto>(StatusCodes.Status404NotFound);

        group.MapGet("/{id:guid}/moves", GetLegalMoves)
            .WithName("GetLegalMoves")
            .WithSummary("Legal moves of the side to move")
            .Produces<IReadOnlyList<LegalMoveDto>>(StatusCodes.Status200OK)
            .Produces<ErrorDto>(StatusCodes.Status404NotFound);

        group.MapPost("/{id:guid}/moves", PlayMove)
            .WithName("PlayMove")
            .WithSummary("Plays a square")
            .Produces<GameStateDto>(StatusCodes.Status200OK)
            .Produces<ErrorDto>(StatusCodes.Status400BadRequest)
            .Produces<ErrorDto>(StatusCodes.Status404NotFound);

        group.MapPost("/{id:guid}/advance", AdvanceComputer)
            .WithName("AdvanceComputer")
            .WithSummary("Lets the computer play its pending turn, after the human move has been seen")
            .Produces<GameStateDto>(StatusCodes.Status200OK)
            .Produces<ErrorDto>(StatusCodes.Status404NotFound);

        group.MapPost("/{id:guid}/pass", PassTurn)
            .WithName("PassTurn")
            .WithSummary("Forfeits the turn, allowed only when no legal move exists")
            .Produces<GameStateDto>(StatusCodes.Status200OK)
            .Produces<ErrorDto>(StatusCodes.Status400BadRequest)
            .Produces<ErrorDto>(StatusCodes.Status404NotFound);

        group.MapPost("/{id:guid}/undo", UndoMove)
            .WithName("UndoMove")
            .WithSummary("Cancels the last entry of the history")
            .Produces<GameStateDto>(StatusCodes.Status200OK)
            .Produces<ErrorDto>(StatusCodes.Status400BadRequest)
            .Produces<ErrorDto>(StatusCodes.Status404NotFound);

        group.MapPost("/{id:guid}/rewind", Rewind)
            .WithName("RewindGame")
            .WithSummary("Rewinds the game to a given point of its history")
            .Produces<GameStateDto>(StatusCodes.Status200OK)
            .Produces<ErrorDto>(StatusCodes.Status400BadRequest)
            .Produces<ErrorDto>(StatusCodes.Status404NotFound);

        group.MapPost("/{id:guid}/demo", LoadDemo)
            .WithName("LoadDemoPosition")
            .WithSummary("Replaces the game with a ready-made position, for demonstration and testing")
            .Produces<GameStateDto>(StatusCodes.Status200OK)
            .Produces<ErrorDto>(StatusCodes.Status400BadRequest)
            .Produces<ErrorDto>(StatusCodes.Status404NotFound);

        group.MapGet("/{id:guid}/history", GetHistory)
            .WithName("GetHistory")
            .WithSummary("Move timeline, forfeited turns included")
            .Produces<IReadOnlyList<MoveHistoryEntryDto>>(StatusCodes.Status200OK)
            .Produces<ErrorDto>(StatusCodes.Status404NotFound);

        return routes;
    }

    private static async Task<IResult> CreateGame(
        CreateGameRequest request,
        GameService games,
        CancellationToken cancellationToken)
    {
        if (request.Opponent == OpponentKind.Computer && request.Level is null)
        {
            return Results.BadRequest(new ErrorDto("A level is required when playing against the computer."));
        }

        if (!Enum.IsDefined(request.Opponent))
        {
            return Results.BadRequest(new ErrorDto($"Unknown opponent '{request.Opponent}'."));
        }

        if (!Enum.IsDefined(request.HumanColor))
        {
            return Results.BadRequest(new ErrorDto($"Unknown colour '{request.HumanColor}'."));
        }

        var record = await games.CreateAsync(request.Opponent, request.Level, request.HumanColor, cancellationToken);
        var state = GameMapper.ToStateDto(record, GameService.Rebuild(record));

        return Results.Created($"/api/games/{record.Id}", state);
    }

    private static async Task<IResult> ListGames(
        GameService games,
        CancellationToken cancellationToken,
        int page = 1,
        int pageSize = 20)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var (items, total) = await games.ListAsync(page, pageSize, cancellationToken);
        var summaries = items.Select(GameMapper.ToSummaryDto).ToArray();

        return Results.Ok(new PagedResultDto<GameSummaryDto>(summaries, page, pageSize, total));
    }

    private static async Task<IResult> GetGame(Guid id, GameService games, CancellationToken cancellationToken)
    {
        var record = await games.FindAsync(id, cancellationToken);

        if (record is null)
        {
            return NotFound(id);
        }

        return Results.Ok(GameMapper.ToStateDto(record, GameService.Rebuild(record)));
    }

    private static async Task<IResult> GetLegalMoves(Guid id, GameService games, CancellationToken cancellationToken)
    {
        var record = await games.FindAsync(id, cancellationToken);

        if (record is null)
        {
            return NotFound(id);
        }

        var game = GameService.Rebuild(record);

        return Results.Ok(game.LegalMoves.Select(GameMapper.ToLegalMoveDto).ToArray());
    }

    private static async Task<IResult> PlayMove(
        Guid id,
        PlayMoveRequest request,
        GameService games,
        CancellationToken cancellationToken)
    {
        var record = await games.FindAsync(id, cancellationToken);

        if (record is null)
        {
            return NotFound(id);
        }

        var game = GameService.Rebuild(record);

        if (request.Player is { } claimed && claimed != game.CurrentPlayer)
        {
            return Results.BadRequest(new ErrorDto($"It is {game.CurrentPlayer}'s turn, not {claimed}'s."));
        }

        var position = new Position(request.Row, request.Col);

        try
        {
            game.Play(position);
        }
        catch (IllegalMoveException exception)
        {
            return Results.BadRequest(new ErrorDto(exception.Message));
        }

        // Deferred: the caller wants to show this move on its own before the reply arrives.
        if (!request.DeferComputer)
        {
            GameService.AdvanceComputer(record, game);
        }

        await games.SaveAsync(record, game, cancellationToken);

        return Results.Ok(GameMapper.ToStateDto(record, game));
    }

    /// <summary>
    /// Plays the computer's pending turn. Doing nothing when it is not its turn keeps the call
    /// safe to repeat, which matters when it is fired from an animation callback.
    /// </summary>
    private static async Task<IResult> AdvanceComputer(
        Guid id,
        GameService games,
        CancellationToken cancellationToken)
    {
        var record = await games.FindAsync(id, cancellationToken);

        if (record is null)
        {
            return NotFound(id);
        }

        var game = GameService.Rebuild(record);
        var before = game.History.Count;

        GameService.AdvanceComputer(record, game);

        if (game.History.Count != before)
        {
            await games.SaveAsync(record, game, cancellationToken);
        }

        return Results.Ok(GameMapper.ToStateDto(record, game));
    }

    private static async Task<IResult> PassTurn(Guid id, GameService games, CancellationToken cancellationToken)
    {
        var record = await games.FindAsync(id, cancellationToken);

        if (record is null)
        {
            return NotFound(id);
        }

        var game = GameService.Rebuild(record);

        try
        {
            game.Pass();
        }
        catch (InvalidOperationException exception)
        {
            return Results.BadRequest(new ErrorDto(exception.Message));
        }

        GameService.AdvanceComputer(record, game);

        await games.SaveAsync(record, game, cancellationToken);

        return Results.Ok(GameMapper.ToStateDto(record, game));
    }

    private static async Task<IResult> UndoMove(Guid id, GameService games, CancellationToken cancellationToken)
    {
        var record = await games.FindAsync(id, cancellationToken);

        if (record is null)
        {
            return NotFound(id);
        }

        var game = GameService.Rebuild(record);

        try
        {
            if (record.Opponent == OpponentKind.Computer)
            {
                // Rewind past the computer's reply, otherwise it replays immediately.
                AiTurn.UndoToHumanTurn(game, record.HumanColor);
            }
            else
            {
                game.Undo();
            }
        }
        catch (InvalidOperationException exception)
        {
            return Results.BadRequest(new ErrorDto(exception.Message));
        }

        await games.SaveAsync(record, game, cancellationToken);

        return Results.Ok(GameMapper.ToStateDto(record, game));
    }

    private static async Task<IResult> Rewind(
        Guid id,
        RewindRequest request,
        GameService games,
        CancellationToken cancellationToken)
    {
        var record = await games.FindAsync(id, cancellationToken);

        if (record is null)
        {
            return NotFound(id);
        }

        var game = GameService.Rebuild(record);

        if (request.MoveNumber < 0 || request.MoveNumber > game.History.Count)
        {
            return Results.BadRequest(new ErrorDto(
                $"Move {request.MoveNumber} is outside the history, which holds {game.History.Count} entries."));
        }

        while (game.History.Count > request.MoveNumber)
        {
            game.Undo();
        }

        await games.SaveAsync(record, game, cancellationToken);

        return Results.Ok(GameMapper.ToStateDto(record, game));
    }

    private static async Task<IResult> LoadDemo(
        Guid id,
        LoadDemoRequest request,
        GameService games,
        CancellationToken cancellationToken)
    {
        var record = await games.FindAsync(id, cancellationToken);

        if (record is null)
        {
            return NotFound(id);
        }

        if (!Enum.IsDefined(request.Position))
        {
            return Results.BadRequest(new ErrorDto($"Unknown demo position '{request.Position}'."));
        }

        var game = DemoPositions.Build(request.Position);

        GameService.AdvanceComputer(record, game);

        await games.SaveAsync(record, game, cancellationToken);

        return Results.Ok(GameMapper.ToStateDto(record, game));
    }

    private static async Task<IResult> GetHistory(Guid id, GameService games, CancellationToken cancellationToken)
    {
        var record = await games.FindAsync(id, cancellationToken);

        if (record is null)
        {
            return NotFound(id);
        }

        var game = GameService.Rebuild(record);

        return Results.Ok(game.History.Select(GameMapper.ToHistoryDto).ToArray());
    }

    private static IResult NotFound(Guid id) =>
        Results.NotFound(new ErrorDto($"Game {id} does not exist."));
}
