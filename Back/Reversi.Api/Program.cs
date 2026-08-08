using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Sqlite;
using Reversi;
using Reversi.Api.Contracts;
using Reversi.Api.Endpoints;
using Reversi.Api.Services;
using Reversi.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
    {
        Title = "Reversi API",
        Version = "v1",
        Description = "Reversi game engine exposed as a REST API. The server is the authority: the front posts moves and reads state."
    });
});

// Enums travel as strings: readable in Swagger, and no magic numbers on the front.
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// Use SQLite in production (simple, fast, single-user game is fine).
// Fall back to appsettings config for local dev with PostgreSQL.
var connectionString = builder.Environment.IsProduction()
    ? "Data Source=reversi.db"
    : (builder.Configuration.GetConnectionString("Reversi") ?? "Data Source=reversi.db");

builder.Services.AddDbContext<ReversiDbContext>(options =>
{
    if (connectionString.StartsWith("Data Source="))
    {
        options.UseSqlite(connectionString);
    }
    else
    {
        options.UseNpgsql(connectionString);
    }
});
builder.Services.AddScoped<GameService>();

const string FrontCorsPolicy = "front";

// Origins from config, with dev defaults as fallback.
// In production (Railway/Vercel), allow the Vercel domain.
var frontOrigins = builder.Configuration.GetSection("FrontOrigins").Get<string[]>()
    ?? (builder.Environment.IsProduction()
        ? ["https://reversi-psi-two.vercel.app", "http://localhost:3000"]
        : ["http://localhost:5213", "http://127.0.0.1:5213"]);

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontCorsPolicy, policy => policy
        .WithOrigins(frontOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

// No EF migrations on this project: EnsureCreated builds the schema, a schema change means a drop.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ReversiDbContext>();
    db.Database.EnsureCreated();
}

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Reversi API v1");
    options.DocumentTitle = "Reversi API";
});

app.UseCors(FrontCorsPolicy);

// Swagger is the landing page in local phase.
app.MapGet("/", () => Results.Redirect("/swagger"))
   .ExcludeFromDescription();

app.MapGet("/api/version", () => Results.Ok(new VersionDto(
        Number: BuildInfo.Number,
        Date: BuildInfo.Date,
        GitVersion: BuildInfo.GitVersion)))
   .WithName("GetVersion")
   .WithTags("System")
   .WithSummary("Build identity served in the top-right corner of the front")
   .Produces<VersionDto>(StatusCodes.Status200OK);

app.MapGameEndpoints();

app.Run();

/// <summary>Exposed so the integration tests can reference the API entry point.</summary>
public partial class Program;
