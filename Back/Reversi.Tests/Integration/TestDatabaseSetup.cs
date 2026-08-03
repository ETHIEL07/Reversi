using Microsoft.EntityFrameworkCore;
using Npgsql;
using Reversi.Data;

namespace Reversi.Tests.Integration;

/// <summary>
/// Drops and recreates the test database once per run, behind a guard that refuses to touch
/// anything other than <see cref="ReversiApiFactory.TestDatabaseName"/>.
/// </summary>
[SetUpFixture]
public class TestDatabaseSetup
{
    [OneTimeSetUp]
    public void ResetTestDatabase()
    {
        var databaseName = new NpgsqlConnectionStringBuilder(ReversiApiFactory.TestConnectionString).Database;

        if (databaseName == ReversiApiFactory.DevelopmentDatabaseName)
        {
            throw new InvalidOperationException(
                "The test suite is pointed at the development database. Aborting before any data is destroyed.");
        }

        if (databaseName != ReversiApiFactory.TestDatabaseName)
        {
            throw new InvalidOperationException(
                $"Unexpected test database '{databaseName}', expected '{ReversiApiFactory.TestDatabaseName}'.");
        }

        var options = new DbContextOptionsBuilder<ReversiDbContext>()
            .UseNpgsql(ReversiApiFactory.TestConnectionString)
            .Options;

        using var db = new ReversiDbContext(options);
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();
    }
}
