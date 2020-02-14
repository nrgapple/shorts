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
                SUB_CHAT_SUCCESS: 'success',
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
                SUB_TYPING_SUCCESS: 'success',
              },
            },
            success: { type: 'final' },
          }
        },
        subToRead: {
          initial: 'start',
          states: {
            start: {
              entry: ['subToRead'],
              on: {
                SUB_READ_SUCCESS: 'sendRead',
              },
            },
            sendRead: {
              entry: ['updateLastRead'],
              on: {
                REC_UPDATED: 'success',
              }
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
                  actions: ['sendTyping'],
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
        recipientTyping: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                REC_TYPED: {
                  target: 'typing',
                  actions: ['scrollToTheBottom'],
                }
              }
            },
            typing: {
              on: {
                REC_STOPPED: {
                  target: 'idle',
                }
              }
            },
            
          }
        },
        recipientMessages: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                REC_INCOMING_MSG: {
                  target: 'incomingMessage',
                }
              }
            },
            incomingMessage: {
              entry: ['sendRead'],
              on: {
                REC_UPDATED: {
                  target: 'idle',
                }
              }
            },
          }
        },
        read: {
          id: 'read',
          initial: 'idle',
          states: {
            idle: {
              on: {
                REC_READ: {
                  target: 'updatingLastRead',
                }
              }
            },
            updatingLastRead: {
              entry: ['updateLastRead'],
              on: {
                READ_UPDATE_SUCCESS: {
                  target: 'idle',
                }
              }
            },
          }
        }
      }
    },
  },
});