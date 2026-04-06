export function formatMinutes(totalMinutes) {
  const minutes = Number(totalMinutes)
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return '0m'
  }

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  if (!hours) {
    return `${remainder}m`
  }

  if (!remainder) {
    return `${hours}h`
  }

  return `${hours}h ${remainder}m`
}