using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Reversi.Tests.Integration;

/// <summary>
/// Boots the real API against the dedicated test database. Never the development one:
/// the guard in <see cref="TestDatabaseSetup"/> refuses to run otherwise.
/// </summary>
public sealed class ReversiApiFactory : WebApplicationFactory<Program>
{
    public const string TestDatabaseName = "Reversi_test";
    public const string DevelopmentDatabaseName = "Reversi_dev";

    public const string TestConnectionString =
        $"Host=localhost;Port=5432;Database={TestDatabaseName};Username=jmp;Password=jmp";

    /// <summary>Enums travel as strings on the wire, the client must read them the same way.</summary>
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, configuration) =>
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Reversi"] = TestConnectionString,
            }));
    }
}
