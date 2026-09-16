const BAD_WORDS = [
  'abuse','ass','bastard','bitch','bloody','crap','cunt',
  'damn','dick','dumb','fool','fuck','hell','idiot','jerk',
  'moron','piss','shit','slut','stupid','whore',
  'behen','bhenc','chut','gand','gaand','harami','kamina',
  'kutta','lund','randi','saala','sala','chutia','ullu',
]

module.exports = function isBadWord(username) {
  const lower = username.toLowerCase()
  return BAD_WORDS.some(w => lower.includes(w))
}