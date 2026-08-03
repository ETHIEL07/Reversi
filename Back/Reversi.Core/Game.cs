namespace Reversi.Core;

/// <summary>
/// A game in progress: board, side to move, history and undo.
/// The engine is the authority; callers ask for legal moves and post a move, they never validate.
/// </summary>
public sealed class Game
{
    private readonly List<PlayedMove> history = [];
    private readonly List<Snapshot> snapshots = [];

    private Board board;

    public Game()
        : this(Board.CreateInitial(), Player.Black)
    {
    }

    /// <summary>Starts from an arbitrary position. Used by the tests and by the demo positions.</summary>
    public Game(Board board, Player currentPlayer)
    {
        ArgumentNullException.ThrowIfNull(board);

        this.board = board;
        CurrentPlayer = currentPlayer;
    }

    public Board Board => board;

    public Player CurrentPlayer { get; private set; }

    public IReadOnlyList<PlayedMove> History => history;

    public IReadOnlyList<LegalMove> LegalMoves => GameRules.GetLegalMoves(board, CurrentPlayer);

    public Score Score => GameRules.GetScore(board);

    public GameStatus Status => GameRules.GetStatus(board);

    public bool IsOver => GameRules.IsGameOver(board);

    /// <summary>
    /// True when the side to move has no legal move while the game is not over.
    /// Forfeiting is then mandatory; it is forbidden when a move is available.
    /// </summary>
    public bool MustPass => !IsOver && !GameRules.HasLegalMove(board, CurrentPlayer);

    public bool CanUndo => snapshots.Count > 0;

    public void Play(Position position)
    {
        if (IsOver)
        {
            throw new IllegalMoveException(position, CurrentPlayer, "The game is over.");
        }

        if (MustPass)
        {
            throw new IllegalMoveException(position, CurrentPlayer, "No legal move available, the turn must be forfeited.");
        }

        PushSnapshot();

        var flips = GameRules.ApplyMove(board, CurrentPlayer, position);
        history.Add(new PlayedMove(history.Count + 1, CurrentPlayer, position, flips));
        CurrentPlayer = CurrentPlayer.Opponent();
    }

    public void Pass()
    {
        if (IsOver)
        {
            throw new InvalidOperationException("The game is over, no turn to forfeit.");
        }

        if (!MustPass)
        {
            throw new InvalidOperationException($"{CurrentPlayer} has a legal move and may not forfeit the turn.");
        }

        PushSnapshot();

        history.Add(new PlayedMove(history.Count + 1, CurrentPlayer, Position: null, Flips: []));
        CurrentPlayer = CurrentPlayer.Opponent();
    }

    /// <summary>Reverts the last entry of the history, board and side to move included.</summary>
    public void Undo()
    {
        if (!CanUndo)
        {
            throw new InvalidOperationException("Nothing to undo.");
        }

        var snapshot = snapshots[^1];
        snapshots.RemoveAt(snapshots.Count - 1);
        history.RemoveAt(history.Count - 1);

        board = snapshot.Board;
        CurrentPlayer = snapshot.CurrentPlayer;
    }

    private void PushSnapshot() => snapshots.Add(new Snapshot(board.Clone(), CurrentPlayer));

    private sealed record Snapshot(Board Board, Player CurrentPlayer);
}
