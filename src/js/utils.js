export function calcTileType(index, boardSize) {
  // TODO: ваш код будет тут
  if (index === 0) {
    return 'top-left';
  }
  if (index === boardSize - 1) {
    return 'top-right';
  }
  if (index > 0 && index < boardSize - 1) {
    return 'top';
  }
  if (index === boardSize * boardSize - boardSize) {
    return 'bottom-left';
  }
  if (index === boardSize * boardSize - 1) {
    return 'bottom-right';
  }
  if (index > boardSize * (boardSize - 1)) {
    return 'bottom';
  }
  if (index % boardSize === 0) {
    return 'left';
  }
  if ((boardSize * boardSize - 1 - index) % boardSize === 0) {
    return 'right';
  }
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
