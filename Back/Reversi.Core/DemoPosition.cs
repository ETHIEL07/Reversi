namespace Reversi.Core;

/// <summary>Ready-made positions, so a screen can be checked without playing thirty moves.</summary>
public enum DemoPosition
{
    /// <summary>Open middlegame: many discs on the board, both sides still have plenty of moves.</summary>
    MidGame = 1,

    /// <summary>Almost finished: a handful of empty squares and a narrow score.</summary>
    Endgame = 2,
}
