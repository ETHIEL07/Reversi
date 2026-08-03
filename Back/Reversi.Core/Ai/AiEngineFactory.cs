namespace Reversi.Core.Ai;

public static class AiEngineFactory
{
    /// <summary>
    /// Builds the engine for a level. The seed only affects the beginner level and exists
    /// so the tests can be deterministic.
    /// </summary>
    public static IAiEngine Create(AiLevel level, int? seed = null) => level switch
    {
        AiLevel.Beginner => new BeginnerAi(seed),
        AiLevel.Normal => new NormalAi(),
        AiLevel.Strong => new StrongAi(),
        _ => throw new ArgumentOutOfRangeException(nameof(level), level, "Unknown level."),
    };
}
