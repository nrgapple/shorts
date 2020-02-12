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
      type: 'parallel',
      states: {
        user: {
          id: 'user',
          initial: 'idle',
          states: {
            idle: {
              on: {
                USER_TYPED: {
                  target: 'typing',
                  actions: ['sendTyping', 'scrollToTheBottom'],
                },
                USER_SENT: {
                  target: 'sendMessage',
                }
              }
            },
            sendMessage: {
              entry: ['sendMessage'],
              on: {
                USER_SENT: {
                  target: 'idle',
                  actions: ['clearInput'],
                }
              }
            },
            typing: {
              entry: ['resetTypingTimout'],
              on: {
                USER_SENT: {
                  target: 'sendMessage',
                  actions: ['stopTyping'],
                },
                USER_TYPED: {
                  target: 'typing',
                },
                USER_STOPPED: {
                  target: 'idle',
                  actions: ['stopTyping'],
                },
              },
            },
          },
        },
        recipient: {
          id: 'recipient',
          initial: 'idle',
          states: {
            idle: {
              on: {
                REC_TYPED: {
                  target: 'typing',
                }
              }
            },
            typing: {
              on: {
                REC_STOPPED: {
                  target: 'idle',
                }
              }
            }
          }
        }
      }

    },
  },
});