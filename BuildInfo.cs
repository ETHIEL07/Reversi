using System.Diagnostics;
using System.Reflection;

namespace Reversi;

/// <summary>
/// Build identity displayed in the top-right corner of every screen.
/// Dynamic variant: Number and Date are derived from the assembly write time,
/// so they change on every build without any manual bump. GitVersion stays manual.
/// </summary>
public static class BuildInfo
{
    /// <summary>Manual version + short git hash, e.g. "v1.0.0 - a1b2c3d".</summary>
    public const string GitVersion = "v1.0.0 - local";

    /// <summary>Build number, format YYMMDD.HHMM.</summary>
    public static string Number { get; } = ResolveBuildTime().ToString("yyMMdd.HHmm");

    /// <summary>Build date, format YYYY-MM-DD HH:MM.</summary>
    public static string Date { get; } = ResolveBuildTime().ToString("yyyy-MM-dd HH:mm");

    private static DateTime ResolveBuildTime()
    {
        var location = Assembly.GetExecutingAssembly().Location;

        if (!string.IsNullOrEmpty(location) && File.Exists(location))
        {
            return File.GetLastWriteTime(location);
        }

        // Single-file or trimmed publish: no assembly on disk, fall back on process start.
        return Process.GetCurrentProcess().StartTime;
    }
}
