import { Machine, send } from 'xstate';

export const chatMachine = Machine({
  id: 'chat-app',
  context: {
  },
  initial: 'init',
  states: {
    init: {
      initial: 'wait',
      states: {
        wait: {
          on: {
            DEPENDENCIES_LOADED: {
              target: 'fetchMessages',
            }
          }
        },
        fetchMessages: {
          initial: 'loadMessages',
          states: {
            loadMessages: {
              invoke: {
                src: 'loadMessages',
                onDone: 'getUnreadMessages',
              },
            },
            getUnreadMessages: {
              entry: ['getUnreadMessages'],
              on: {
                SUCCESS: {
                  target: 'finish'
                }
              }
            },
            finish: {
              type: 'final',
            }
          },
          onDone: 'finish',
        },
        finish: {
          type: 'final',
        }
      },
      onDone: 'subscribe',
    },
    subscribe: {
      type: 'parallel',
      states: {
        subToChat: {
          initial: 'start',
          states: {
            start: {
              entry: ['subToChat'],
              on: {
                SUCCESS: 'success',
              },
            },
            success: { type: 'final' },
          }
        },
        subToTyping: {
          initial: 'start',
          states: {
            start: {
              entry: ['subToTyping'],
              on: {
                SUCCESS: 'success',
              },
            },
            success: { type: 'final' },
          }
        },
      },
      onDone: 'ready'
    },
    ready:
    {
      initial: 'idle',
      states: {
        idle: {
          on: {
            TYPED: {
              target: 'typing',
              actions: ['sendTyping', 'scrollToTheBottom'],
            },
            SENT: {
              target: 'sendMessage',
            }
          }
        },
        sendMessage: {
          entry: ['sendMessage'],
          on: {
            SENT: {
              target: 'idle',
              actions: ['clearInput'],
            }
          }
        },
        typing: {
          entry: ['resetTypingTimout'],
          on: {
            SENT: {
              target: 'sendMessage',
              actions: ['stopTyping'],
            },
            TYPED: {
              target: 'typing',
            },
            STOPPED: {
              target: 'idle',
              actions: ['stopTyping'],
            },
          },
        },
      },
    },
  },
});