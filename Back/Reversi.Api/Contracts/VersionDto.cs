namespace Reversi.Api.Contracts;

/// <summary>Build identity returned by GET /api/version.</summary>
/// <param name="Number">Build number, format YYMMDD.HHMM.</param>
/// <param name="Date">Build date, format YYYY-MM-DD HH:MM.</param>
/// <param name="GitVersion">Manual version and short git hash.</param>
public sealed record VersionDto(string Number, string Date, string GitVersion);
