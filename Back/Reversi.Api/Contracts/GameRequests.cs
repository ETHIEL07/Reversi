using Reversi.Core;

namespace Reversi.Api.Contracts;

/// <summary>
/// Creates a game. Against the computer a level is required; the engines arrive in lot 5,
/// so for now the computer never plays on its own.
/// </summary>
/// <param name="Opponent">Human for two players on one device, Computer otherwise.</param>
/// <param name="Level">Difficulty, required when the opponent is the computer.</param>
/// <param name="HumanColor">Colour played by the human. Black moves first.</param>
public sealed record CreateGameRequest(
    OpponentKind Opponent = OpponentKind.Human,
    AiLevel? Level = null,
    Player HumanColor = Player.Black);

/// <summary>
/// Plays a square. <paramref name="Player"/> is optional; when supplied it must match the
/// side to move, which is how playing out of turn is rejected.
/// </summary>
/// <param name="DeferComputer">
/// When true the computer does not reply in the same response. The caller gets the board as it
/// stands right after the human move and asks for the reply with <c>/advance</c> once its
/// animation has been seen. Without it the two moves land together and the first is invisible.
/// </param>
public sealed record PlayMoveRequest(int Row, int Col, Player? Player = null, bool DeferComputer = false);

/// <summary>Loads a ready-made position into an existing game, for demonstration and testing.</summary>
public sealed record LoadDemoRequest(DemoPosition Position = DemoPosition.MidGame);

/// <summary>
/// Rewinds the game to the state it had after <paramref name="MoveNumber"/> entries of the
/// history. Zero goes back to the opening position.
/// </summary>
public sealed record RewindRequest(int MoveNumber);
