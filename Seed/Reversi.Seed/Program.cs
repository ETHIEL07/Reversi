using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

// Demo data lives here, never in the backend. The seed only talks to the public API,
// exactly like the front does.

var baseAddress = args.Length > 0 ? args[0] : "http://localhost:5210";
var count = args.Length > 1 && int.TryParse(args[1], out var requested) ? requested : 12;

var json = new JsonSerializerOptions(JsonSerializerDefaults.Web)
{
    Converters = { new JsonStringEnumConverter() },
};

using var client = new HttpClient { BaseAddress = new Uri(baseAddress), Timeout = TimeSpan.FromSeconds(30) };

Console.WriteLine($"[Seed] API {baseAddress}");

try
{
    var version = await client.GetFromJsonAsync<VersionDto>("/api/version", json);
    Console.WriteLine($"[Seed] Build {version?.Number} {version?.GitVersion}");
}
catch (HttpRequestException exception)
{
    Console.Error.WriteLine($"[Seed] The API is not answering: {exception.Message}");
    Console.Error.WriteLine("[Seed] Start it with _RunBackendReversi.cmd, then run this again.");
    return 1;
}

var levels = new[] { "Beginner", "Normal", "Strong" };
var demos = new[] { "MidGame", "Endgame" };
var created = 0;

for (var index = 0; index < count; index++)
{
    var againstComputer = index % 3 != 0;

    var creation = await client.PostAsJsonAsync(
        "/api/games",
        new
        {
            opponent = againstComputer ? "Computer" : "Human",
            level = againstComputer ? levels[index % levels.Length] : null,
            humanColor = index % 2 == 0 ? "Black" : "White",
        },
        json);

    if (!creation.IsSuccessStatusCode)
    {
        Console.Error.WriteLine($"[Seed] Creation refused: {creation.StatusCode}");
        continue;
    }

    var game = await creation.Content.ReadFromJsonAsync<GameStateDto>(json);

    if (game is null)
    {
        continue;
    }

    // Half of the games get a ready-made position so the list is not full of empty boards.
    if (index % 2 == 0)
    {
        await client.PostAsJsonAsync(
            $"/api/games/{game.Id}/demo",
            new { position = demos[index % demos.Length] },
            json);
    }

    created++;
    Console.WriteLine($"[Seed] {created,2}. {game.Id}  {(againstComputer ? "computer" : "human")}");
}

Console.WriteLine($"[Seed] Done, {created} games created.");
return 0;

internal sealed record VersionDto(string Number, string Date, string GitVersion);

internal sealed record GameStateDto(Guid Id, int MoveCount);
