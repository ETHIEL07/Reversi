using Reversi.Core;

namespace Reversi.Data;

/// <summary>
/// A persisted game. The move list is the source of truth: the board is rebuilt by replaying it.
/// The other columns are denormalised so the paged list does not have to replay every game.
/// </summary>
public class GameRecord
{
    public Guid Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public OpponentKind Opponent { get; set; }

    /// <summary>Difficulty, only set when the opponent is the computer.</summary>
    public AiLevel? Level { get; set; }

    /// <summary>Colour played by the human. Meaningless in a two-player game.</summary>
    public Player HumanColor { get; set; }

    /// <summary>Comma separated notations, "--" for a forfeited turn. Empty on a fresh game.</summary>
    public string MovesCsv { get; set; } = string.Empty;

    public int MoveCount { get; set; }

    public Player CurrentPlayer { get; set; }

    public GameStatus Status { get; set; }

    public int BlackScore { get; set; }

    public int WhiteScore { get; set; }
}
