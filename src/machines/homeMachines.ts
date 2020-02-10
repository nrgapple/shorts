import { Machine } from 'xstate'
import {loadNearMe} from '../data/sessions/sessions.actions'

export const homeMachine = Machine({
  id: 'home',
  context: {},
  initial: 'start',
  states: {
    start: {
      on: {
        LOAD: {
          target: 'loading',
        },
        NOT_LOGGED_IN: {
          target: 'notLoggedIn',
        }
      },
    },
    loading: {
      entry: ['load'],
      on: {
        FOUND_NO_USER_PROFILES: {
          target: 'unFinishedProfile'
        },
        LOADED_NOTHING: {
          target: 'noMatches'
        },
        LOADED_MATCHES: {
          target: 'matches'
        },
      }
    },
    noMatches: {},
    matches: {},
    unFinishedProfile: {},
    notLoggedIn: {},
  }
});

export const swipeMachine = Machine({
  id: 'swipe',
  context: {},
  initial: 'idle',
  states: {
    idle: {
      on: {
        SWIPED_LEFT: {
          target: 'like',
        },
        SWIPED_RIGHT: {
          target: 'pass',
        }
      }
    },
    like: {
      entry: ['onLike'],
      on: {
        SUCCESS: {
          target: 'loadingNext',
        }
      }
    },
    pass: {
      entry: ['onPass'],
      on: {
        SUCCESS: {
          target: 'loadingNext',
        }
      }
    },
    match: {
      entry: ['match'],
      on: {
        DISMISS: {
          target: 'loadingNext',
        }
      }
    },
    loadingNext: {
      on: {
        DONE : {
          target: 'idle'
        }
      }
    }
  }
});