module.exports = {
  trimDecimals: function (number, numberOfDecimals) {
    var decimals = Math.pow(10, numberOfDecimals)
    return parseInt(number * decimals, 10) / decimals
  },
  isPartial: function (pomodoro) {
    return !!pomodoro.cancelledAt && pomodoro.cancelledAt > pomodoro.startedAt && (pomodoro.cancelledAt - pomodoro.startedAt) < 25 * 60 * 1000
  },
  cleanPomodoro: function (rawPomodoro) {
    return {
      startedAt: rawPomodoro.startedAt,
      minutes: rawPomodoro.minutes,
      type: rawPomodoro.type,
      tags: rawPomodoro.tags,
      distractions: rawPomodoro.distractions,
      cancelledAt: rawPomodoro.cancelledAt
    }
  }
}
