namespace Reversi.Core;

/// <summary>Raised when a move is rejected. Carries enough context for a useful 400 response.</summary>
public sealed class IllegalMoveException : InvalidOperationException
{
    public IllegalMoveException(Position position, Player player, string reason)
        : base($"Illegal move {position.Notation} for {player}: {reason}")
    {
        Position = position;
        Player = player;
        Reason = reason;
    }

    public Position Position { get; }

    public Player Player { get; }

    public string Reason { get; }
}
