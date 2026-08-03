namespace Reversi.Tests;

/// <summary>
/// Skeleton-level checks. The real engine suite lands in lot 2.
/// </summary>
[TestFixture]
public class BuildInfoTests
{
    [Test]
    public void Number_IsNotEmpty()
    {
        Assert.That(BuildInfo.Number, Is.Not.Null.And.Not.Empty);
    }

    [Test]
    public void Number_MatchesYymmddDotHhmm()
    {
        Assert.That(BuildInfo.Number, Does.Match(@"^\d{6}\.\d{4}$"));
    }

    [Test]
    public void GitVersion_IsNotEmpty()
    {
        Assert.That(BuildInfo.GitVersion, Is.Not.Null.And.Not.Empty);
    }
}
