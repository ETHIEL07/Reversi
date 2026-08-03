namespace Reversi.Core;

/// <summary>
/// How a single disc stands on the board. Drives the visual treatment of the pieces:
/// a stable disc can be shown as secured, a disc at risk as threatened.
/// </summary>
/// <param name="Position">Square holding the disc.</param>
/// <param name="State">Colour of the disc.</param>
/// <param name="IsCorner">The square is one of the four corners, permanently safe.</param>
/// <param name="IsStable">The disc can never be flipped again, whatever both sides play.</param>
/// <param name="IsAtRisk">The side to move can flip this disc right now.</param>
public sealed record CellAnalysis(
    Position Position,
    CellState State,
    bool IsCorner,
    bool IsStable,
    bool IsAtRisk);

/// <summary>Analysis of every occupied square, plus the aggregates used by the UI.</summary>
public sealed record BoardAnalysis(
    IReadOnlyList<CellAnalysis> Cells,
    int StableBlack,
    int StableWhite,
    int AtRiskBlack,
    int AtRiskWhite);
