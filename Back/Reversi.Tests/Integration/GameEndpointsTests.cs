using System.Net;
using System.Net.Http.Json;
using Reversi.Api.Contracts;
using Reversi.Core;

namespace Reversi.Tests.Integration;

[TestFixture]
public class GameEndpointsTests
{
    private ReversiApiFactory factory = null!;
    private HttpClient client = null!;

    [OneTimeSetUp]
    public void StartApi()
    {
        factory = new ReversiApiFactory();
        client = factory.CreateClient();
    }

    [OneTimeTearDown]
    public void StopApi()
    {
        client.Dispose();
        factory.Dispose();
    }

    private async Task<GameStateDto> CreateGameAsync(
        OpponentKind opponent = OpponentKind.Human,
        AiLevel? level = null)
    {
        var response = await client.PostAsJsonAsync(
            "/api/games",
            new CreateGameRequest(opponent, level),
            ReversiApiFactory.Json);

        response.EnsureSuccessStatusCode();

        return (await response.Content.ReadFromJsonAsync<GameStateDto>(ReversiApiFactory.Json))!;
    }

    [Test]
    public async Task CreateGame_ReturnsCreatedWithACoherentOpeningState()
    {
        var response = await client.PostAsJsonAsync(
            "/api/games",
            new CreateGameRequest(),
            ReversiApiFactory.Json);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Created));

        var state = await response.Content.ReadFromJsonAsync<GameStateDto>(ReversiApiFactory.Json);

        Assert.That(state, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(state!.Id, Is.Not.EqualTo(Guid.Empty));
            Assert.That(state.Board, Has.Count.EqualTo(8));
            Assert.That(state.CurrentPlayer, Is.EqualTo(Player.Black));
            Assert.That(state.Score, Is.EqualTo(new ScoreDto(2, 2)));
            Assert.That(state.Status, Is.EqualTo(GameStatus.InProgress));
            Assert.That(state.LegalMoves, Has.Count.EqualTo(4));
            Assert.That(state.Analysis, Has.Count.EqualTo(4));
            Assert.That(state.MoveCount, Is.Zero);
            Assert.That(state.CanUndo, Is.False);
            Assert.That(state.MustPass, Is.False);
        });

        Assert.That(response.Headers.Location, Is.Not.Null);
    }

    [Test]
    public async Task CreateGame_AgainstTheComputerWithoutALevel_IsRejected()
    {
        var response = await client.PostAsJsonAsync(
            "/api/games",
            new CreateGameRequest(OpponentKind.Computer),
            ReversiApiFactory.Json);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));

        var error = await response.Content.ReadFromJsonAsync<ErrorDto>(ReversiApiFactory.Json);

        Assert.That(error!.Message, Is.Not.Empty);
    }

    [Test]
    public async Task CreateGame_AgainstTheComputerKeepsTheLevel()
    {
        var state = await CreateGameAsync(OpponentKind.Computer, AiLevel.Strong);

        Assert.Multiple(() =>
        {
            Assert.That(state.Opponent, Is.EqualTo(OpponentKind.Computer));
            Assert.That(state.Level, Is.EqualTo(AiLevel.Strong));
        });
    }

    [Test]
    public async Task GetGame_ReturnsNotFoundForAnUnknownIdentifier()
    {
        var response = await client.GetAsync($"/api/games/{Guid.NewGuid()}");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));

        var error = await response.Content.ReadFromJsonAsync<ErrorDto>(ReversiApiFactory.Json);

        Assert.That(error!.Message, Is.Not.Empty);
    }

    [Test]
    public async Task GetLegalMoves_ReturnsTheFourOpeningMoves()
    {
        var game = await CreateGameAsync();

        var moves = await client.GetFromJsonAsync<List<LegalMoveDto>>(
            $"/api/games/{game.Id}/moves",
            ReversiApiFactory.Json);

        Assert.That(moves, Has.Count.EqualTo(4));
        Assert.That(
            moves!.Select(move => move.Notation).OrderBy(notation => notation),
            Is.EqualTo(new[] { "c4", "d3", "e6", "f5" }));
    }

    [Test]
    public async Task PlayMove_OnALegalSquare_UpdatesTheBoardAndHandsOverTheTurn()
    {
        var game = await CreateGameAsync();

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/moves",
            new PlayMoveRequest(2, 3),
            ReversiApiFactory.Json);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var state = await response.Content.ReadFromJsonAsync<GameStateDto>(ReversiApiFactory.Json);

        Assert.Multiple(() =>
        {
            Assert.That(state!.Score, Is.EqualTo(new ScoreDto(4, 1)));
            Assert.That(state.CurrentPlayer, Is.EqualTo(Player.White));
            Assert.That(state.MoveCount, Is.EqualTo(1));
            Assert.That(state.CanUndo, Is.True);
            Assert.That(state.Board[2][3], Is.EqualTo('B'));
            Assert.That(state.Board[3][3], Is.EqualTo('B'));
        });
    }

    [Test]
    public async Task PlayMove_OnAnIllegalSquare_IsRejectedWithAUsableMessage()
    {
        var game = await CreateGameAsync();

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/moves",
            new PlayMoveRequest(0, 0),
            ReversiApiFactory.Json);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));

        var error = await response.Content.ReadFromJsonAsync<ErrorDto>(ReversiApiFactory.Json);

        Assert.That(error!.Message, Does.Contain("a1"));
    }

    [Test]
    public async Task PlayMove_OutsideTheBoard_IsRejected()
    {
        var game = await CreateGameAsync();

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/moves",
            new PlayMoveRequest(-1, 99),
            ReversiApiFactory.Json);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task PlayMove_WhenItIsNotThatPlayersTurn_IsRejected()
    {
        var game = await CreateGameAsync();

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/moves",
            new PlayMoveRequest(2, 3, Player.White),
            ReversiApiFactory.Json);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));

        var error = await response.Content.ReadFromJsonAsync<ErrorDto>(ReversiApiFactory.Json);

        Assert.That(error!.Message, Does.Contain("Black"));
    }

    [Test]
    public async Task Pass_IsRejectedWhileALegalMoveExists()
    {
        var game = await CreateGameAsync();

        var response = await client.PostAsync($"/api/games/{game.Id}/pass", content: null);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Undo_RestoresTheStateBeforeTheLastMove()
    {
        var game = await CreateGameAsync();

        await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/moves",
            new PlayMoveRequest(2, 3),
            ReversiApiFactory.Json);

        var response = await client.PostAsync($"/api/games/{game.Id}/undo", content: null);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var state = await response.Content.ReadFromJsonAsync<GameStateDto>(ReversiApiFactory.Json);

        Assert.Multiple(() =>
        {
            Assert.That(state!.Score, Is.EqualTo(new ScoreDto(2, 2)));
            Assert.That(state.CurrentPlayer, Is.EqualTo(Player.Black));
            Assert.That(state.MoveCount, Is.Zero);
            Assert.That(state.CanUndo, Is.False);
        });
    }

    [Test]
    public async Task Undo_OnAFreshGame_IsRejected()
    {
        var game = await CreateGameAsync();

        var response = await client.PostAsync($"/api/games/{game.Id}/undo", content: null);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task History_ListsThePlayedMovesInOrder()
    {
        var game = await CreateGameAsync();

        await client.PostAsJsonAsync($"/api/games/{game.Id}/moves", new PlayMoveRequest(2, 3), ReversiApiFactory.Json);
        await client.PostAsJsonAsync($"/api/games/{game.Id}/moves", new PlayMoveRequest(2, 2), ReversiApiFactory.Json);

        var history = await client.GetFromJsonAsync<List<MoveHistoryEntryDto>>(
            $"/api/games/{game.Id}/history",
            ReversiApiFactory.Json);

        Assert.That(history, Has.Count.EqualTo(2));
        Assert.Multiple(() =>
        {
            Assert.That(history![0].Number, Is.EqualTo(1));
            Assert.That(history[0].Notation, Is.EqualTo("d3"));
            Assert.That(history[0].Player, Is.EqualTo(Player.Black));
            Assert.That(history[1].Notation, Is.EqualTo("c3"));
            Assert.That(history[1].Player, Is.EqualTo(Player.White));
        });
    }

    [Test]
    public async Task ListGames_IsPagedAndOrderedByMostRecent()
    {
        await CreateGameAsync();

        var page = await client.GetFromJsonAsync<PagedResultDto<GameSummaryDto>>(
            "/api/games?page=1&pageSize=5",
            ReversiApiFactory.Json);

        Assert.Multiple(() =>
        {
            Assert.That(page!.Page, Is.EqualTo(1));
            Assert.That(page.PageSize, Is.EqualTo(5));
            Assert.That(page.Total, Is.GreaterThan(0));
            Assert.That(page.Items, Has.Count.LessThanOrEqualTo(5));
        });
    }

    [Test]
    public async Task LoadDemo_ReplacesTheGameWithAPlayableMiddlegame()
    {
        var game = await CreateGameAsync();

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/demo",
            new LoadDemoRequest(DemoPosition.MidGame),
            ReversiApiFactory.Json);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var state = await response.Content.ReadFromJsonAsync<GameStateDto>(ReversiApiFactory.Json);

        Assert.Multiple(() =>
        {
            Assert.That(state!.MoveCount, Is.GreaterThanOrEqualTo(20));
            Assert.That(state.Score.Black + state.Score.White, Is.GreaterThan(20));
            Assert.That(state.IsOver, Is.False);
            Assert.That(state.LegalMoves, Is.Not.Empty);
            Assert.That(state.CanUndo, Is.True);
        });
    }

    [Test]
    public async Task PlayMove_WithDeferComputer_LeavesTheReplyPending()
    {
        var game = await CreateGameAsync(OpponentKind.Computer, AiLevel.Beginner);

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/moves",
            new PlayMoveRequest(2, 3, null, DeferComputer: true),
            ReversiApiFactory.Json);

        var state = await response.Content.ReadFromJsonAsync<GameStateDto>(ReversiApiFactory.Json);

        Assert.Multiple(() =>
        {
            // Only the human move landed, so the front can show it on its own.
            Assert.That(state!.MoveCount, Is.EqualTo(1));
            Assert.That(state.CurrentPlayer, Is.EqualTo(Player.White));
            Assert.That(state.LastMove, Is.Not.Null);
            Assert.That(state.LastMove!.Row, Is.EqualTo(2));
            Assert.That(state.LastMove.Col, Is.EqualTo(3));
            Assert.That(state.LastMove.Player, Is.EqualTo(Player.Black));
            Assert.That(state.LastMove.Flips, Is.Not.Empty);
        });
    }

    [Test]
    public async Task Advance_PlaysThePendingComputerTurn()
    {
        var game = await CreateGameAsync(OpponentKind.Computer, AiLevel.Beginner);

        await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/moves",
            new PlayMoveRequest(2, 3, null, DeferComputer: true),
            ReversiApiFactory.Json);

        var response = await client.PostAsync($"/api/games/{game.Id}/advance", null);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var state = await response.Content.ReadFromJsonAsync<GameStateDto>(ReversiApiFactory.Json);

        Assert.Multiple(() =>
        {
            Assert.That(state!.MoveCount, Is.EqualTo(2));
            Assert.That(state.CurrentPlayer, Is.EqualTo(Player.Black));
            Assert.That(state.LastMove!.Player, Is.EqualTo(Player.White));
        });
    }

    [Test]
    public async Task Advance_OnTheHumanTurnChangesNothing()
    {
        var game = await CreateGameAsync(OpponentKind.Computer, AiLevel.Beginner);

        // Called twice in a row: the second one has no pending computer turn to play.
        await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/moves",
            new PlayMoveRequest(2, 3, null, DeferComputer: true),
            ReversiApiFactory.Json);

        await client.PostAsync($"/api/games/{game.Id}/advance", null);

        var response = await client.PostAsync($"/api/games/{game.Id}/advance", null);
        var state = await response.Content.ReadFromJsonAsync<GameStateDto>(ReversiApiFactory.Json);

        Assert.Multiple(() =>
        {
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            Assert.That(state!.MoveCount, Is.EqualTo(2));
        });
    }

    [Test]
    public async Task Advance_ReturnsNotFoundForAnUnknownGame()
    {
        var response = await client.PostAsync($"/api/games/{Guid.NewGuid()}/advance", null);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task PlayMove_WithoutTheFlag_StillAnswersImmediately()
    {
        var game = await CreateGameAsync(OpponentKind.Computer, AiLevel.Beginner);

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/moves",
            new PlayMoveRequest(2, 3),
            ReversiApiFactory.Json);

        var state = await response.Content.ReadFromJsonAsync<GameStateDto>(ReversiApiFactory.Json);

        Assert.That(state!.MoveCount, Is.EqualTo(2));
    }

    [Test]
    public async Task Rewind_TakesTheGameBackToAGivenMove()
    {
        var game = await CreateGameAsync();

        await client.PostAsJsonAsync($"/api/games/{game.Id}/demo", new LoadDemoRequest(DemoPosition.MidGame), ReversiApiFactory.Json);

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/rewind",
            new RewindRequest(6),
            ReversiApiFactory.Json);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var state = await response.Content.ReadFromJsonAsync<GameStateDto>(ReversiApiFactory.Json);

        Assert.Multiple(() =>
        {
            Assert.That(state!.MoveCount, Is.EqualTo(6));
            Assert.That(state.IsOver, Is.False);
            Assert.That(state.LegalMoves, Is.Not.Empty);
        });
    }

    [Test]
    public async Task Rewind_ToZeroRestoresTheOpeningPosition()
    {
        var game = await CreateGameAsync();

        await client.PostAsJsonAsync($"/api/games/{game.Id}/moves", new PlayMoveRequest(2, 3), ReversiApiFactory.Json);

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/rewind",
            new RewindRequest(0),
            ReversiApiFactory.Json);

        var state = await response.Content.ReadFromJsonAsync<GameStateDto>(ReversiApiFactory.Json);

        Assert.Multiple(() =>
        {
            Assert.That(state!.MoveCount, Is.Zero);
            Assert.That(state.Score, Is.EqualTo(new ScoreDto(2, 2)));
            Assert.That(state.CurrentPlayer, Is.EqualTo(Player.Black));
        });
    }

    [Test]
    public async Task Rewind_BeyondTheHistoryIsRejected()
    {
        var game = await CreateGameAsync();

        var response = await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/rewind",
            new RewindRequest(40),
            ReversiApiFactory.Json);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task LoadDemo_ReturnsNotFoundForAnUnknownGame()
    {
        var response = await client.PostAsJsonAsync(
            $"/api/games/{Guid.NewGuid()}/demo",
            new LoadDemoRequest(DemoPosition.MidGame),
            ReversiApiFactory.Json);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task AFullGamePlayedThroughTheApiEndsWithAValidScore()
    {
        var game = await CreateGameAsync();
        var state = game;
        var safety = 0;

        while (!state.IsOver && safety++ < 150)
        {
            HttpResponseMessage response;

            if (state.MustPass)
            {
                response = await client.PostAsync($"/api/games/{game.Id}/pass", content: null);
            }
            else
            {
                var move = state.LegalMoves[0];
                response = await client.PostAsJsonAsync(
                    $"/api/games/{game.Id}/moves",
                    new PlayMoveRequest(move.Row, move.Col),
                    ReversiApiFactory.Json);
            }

            response.EnsureSuccessStatusCode();
            state = (await response.Content.ReadFromJsonAsync<GameStateDto>(ReversiApiFactory.Json))!;
        }

        Assert.Multiple(() =>
        {
            Assert.That(state.IsOver, Is.True, "the game should reach its end through the API");
            Assert.That(safety, Is.LessThan(150), "no infinite loop");
            Assert.That(state.Status, Is.Not.EqualTo(GameStatus.InProgress));
            Assert.That(state.Score.Black + state.Score.White, Is.GreaterThan(4).And.LessThanOrEqualTo(64));
            Assert.That(state.LegalMoves, Is.Empty);
        });
    }
}
