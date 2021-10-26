

export function addKeyboardListeners() {

  const keys = {
    ShiftLeft: false,
    ArrowLeft: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowRight: false,
    KeyQ: false,
    KeyA: false,
    KeyZ: false,
    KeyR: false,
  }

  const events = [
  ]

  document.addEventListener('keydown', e => pressed(e));
  document.addEventListener('keyup', e => released(e));

  function pressed(e) {
    keys[e.code] = true

    for (let i = 0; i<events.length; i++) {
      const conditionCount = events[i].conditions.reduce((count, condition) => count += keys[condition] ? 1 : 0, 0)
      if (conditionCount === events[i].conditions.length) events[i].action()
    }
  }

  function released(e) {
    keys[e.code] = false
  }

  return {
    addEvent: (event) => events.push(event)
  }
}

