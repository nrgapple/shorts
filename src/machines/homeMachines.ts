import { Machine } from 'xstate';

export const homeMachine = Machine({
  id: 'home',
  context: {},
  initial: 'start',
  states: {
    start: {
      on: {
        LOAD: {
          target: 'loading',
          actions: 'fetchData',
        },
        NOT_LOGGED_IN: {
          target: 'notLoggedIn',
        }
      },
    },
    resetting: {
      on: {
        LOAD: {
          target: 'loading',
          actions: 'fetchData',
        },
        NOT_LOGGED_IN: {
          target: 'notLoggedIn',
        }
      },
    },
    loading: {
      on: {
        FOUND_NO_USER_PROFILES: {
          target: 'unFinishedProfile',
        },
        LOADED_NOTHING: {
          target: 'noMatches',
        },
        LOADED_MATCHES: {
          target: 'matches',
        },
        RESET: {
          target: 'start',
        },
      },
    },
    noMatches: {
      on: {
        LOAD: {
          target: 'loading',
          actions: 'fetchData',
        },
        RESET: {
          target: 'resetting',
        },
      },
    },
    matches: {
      on: {
        LOAD: {
          target: 'loading',
          actions: 'fetchData',
        },
        RESET: {
          target: 'resetting',
        },
      },

    },
    unFinishedProfile: {
      on: {
        RESET: {
          target: 'resetting',
        },
      },
    },
    notLoggedIn: {
      on: {
        RESET: {
          target: 'resetting',
        },
      },
    },
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
          target: 'pass',
        },
        SWIPED_RIGHT: {
          target: 'like',
        }
      }
    },
    like: {
      entry: ['onLike'],
      on: {
        SUCCESS: {
          target: 'loadingNextProfile',
          actions: 'next'
        },
        GOT_MATCH: {
          target: 'match'
        }
      }
    },
    pass: {
      entry: ['onPass'],
      on: {
        SUCCESS: {
          target: 'loadingNextProfile',
          actions: 'next'
        }
      }
    },
    match: {
      entry: ['onMatch'],
      on: {
        DISMISS: {
          target: 'loadingNextProfile',
        }
      }
    },
    loadingNextProfile: {
      entry: ['onNext'],
      on: {
        SUCCESS: {
          target: 'idle',
          actions: 'next'
        }
      }
    }
  }
});