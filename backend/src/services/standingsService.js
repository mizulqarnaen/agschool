export const DEFAULT_POINT_SCHEMA = {
  "1": 10,
  "2": 9,
  "3": 8,
  "4": 7,
  "5": 6,
  "6": 5,
  "7": 4,
  "8": 3,
  "9": 2,
  "10": 1
};

export const calculatePlayerStats = (playerRow, pointSchema = DEFAULT_POINT_SCHEMA) => {
  const matches = playerRow.matches || {};
  let totalPoints = 0;
  const placements = [];

  Object.values(matches).forEach((p) => {
    const num = Number(p);
    if (!isNaN(num) && num > 0) {
      placements.push(num);
      const pts = pointSchema[num] !== undefined ? Number(pointSchema[num]) : 0;
      totalPoints += pts;
    }
  });

  // Sort placements ascending (best finish first: 1, 2, 5, etc.)
  placements.sort((a, b) => a - b);

  return {
    ...playerRow,
    total_points: totalPoints,
    placements,
    best_placement: placements.length > 0 ? placements[0] : 999
  };
};

export const sortStandings = (participants, pointSchema = DEFAULT_POINT_SCHEMA) => {
  const statsList = participants.map(p => calculatePlayerStats(p, pointSchema));

  statsList.sort((a, b) => {
    // Primary: Total Points DESC
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }

    // Secondary & Tertiary: Compare placements array index by index (ASC: lower finish number is better)
    const len = Math.max(a.placements.length, b.placements.length);
    for (let i = 0; i < len; i++) {
      const posA = a.placements[i] !== undefined ? a.placements[i] : 999;
      const posB = b.placements[i] !== undefined ? b.placements[i] : 999;
      if (posA !== posB) {
        return posA - posB;
      }
    }

    // Quaternary: Name ASC
    return (a.player_name || '').localeCompare(b.player_name || '');
  });

  // Assign ranks & tie-breaker notes
  return statsList.map((item, index, arr) => {
    const rank = index + 1;
    let tieNote = null;

    // Check if tied with someone else on total points
    const prev = arr[index - 1];
    const next = arr[index + 1];
    const isTiedPoints = (prev && prev.total_points === item.total_points) || (next && next.total_points === item.total_points);

    if (isTiedPoints) {
      tieNote = `Unggul posisi terbaik #${item.best_placement}`;
    }

    return {
      ...item,
      rank,
      tie_note: tieNote
    };
  });
};
