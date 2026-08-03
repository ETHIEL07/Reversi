using Microsoft.EntityFrameworkCore;

namespace Reversi.Data;

/// <summary>
/// Schema is created by EnsureCreated, there are no EF migrations on this project.
/// Changing an entity means dropping the database and letting it be recreated.
/// </summary>
public sealed class ReversiDbContext(DbContextOptions<ReversiDbContext> options) : DbContext(options)
{
    public DbSet<GameRecord> Games => Set<GameRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);

        var game = modelBuilder.Entity<GameRecord>();

        game.HasKey(record => record.Id);
        game.Property(record => record.MovesCsv).HasMaxLength(512).IsRequired();
        game.Property(record => record.Opponent).HasConversion<int>();
        game.Property(record => record.Level).HasConversion<int?>();
        game.Property(record => record.HumanColor).HasConversion<int>();
        game.Property(record => record.CurrentPlayer).HasConversion<int>();
        game.Property(record => record.Status).HasConversion<int>();
        game.HasIndex(record => record.CreatedAt);

        base.OnModelCreating(modelBuilder);
    }
}
