namespace Reversi.Core;

/// <summary>The two sides. Black always moves first (World Othello Federation rules).</summary>
public enum Player
{
    Black = 1,
    White = 2,
}

public static class PlayerExtensions
{
    public static Player Opponent(this Player player) =>
        player == Player.Black ? Player.White : Player.Black;

    public static CellState ToCellState(this Player player) =>
        player == Player.Black ? CellState.Black : CellState.White;
}
