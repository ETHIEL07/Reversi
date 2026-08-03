using System.Net.Http.Json;
using Reversi.Api.Contracts;

namespace Reversi.Tests.Integration;

[TestFixture]
public class VersionEndpointTests
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

    [Test]
    public async Task Version_ReturnsANonEmptyBuildNumber()
    {
        var version = await client.GetFromJsonAsync<VersionDto>("/api/version", ReversiApiFactory.Json);

        Assert.That(version, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(version!.Number, Is.Not.Empty);
            Assert.That(version.Number, Does.Match(@"^\d{6}\.\d{4}$"));
            Assert.That(version.Date, Is.Not.Empty);
            Assert.That(version.GitVersion, Is.Not.Empty);
        });
    }
}
