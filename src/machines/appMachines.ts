import { Machine } from 'xstate';

export const appMachine = Machine({
  id: 'shorts-app',
  context: {},
  type: 'parallel',
  states: {
    start: {
      initial: 'load',
      states: {
        load: {
          initial: 'loadUser',
          states: {
            loadUser: {
              entry: ['loadUser'],
              on: {
                USER_LOADED: {
                  target: 'connectAndGather',
                }
              }
            },
            connectAndGather: {
              type: 'parallel',
              states: {
                setupClientLocation: {
                  initial: 'loadLocation',
                  states: {
                    loadLocation: {
                      entry: ['loadLocation'],
                      on: {
                        LOCATION_LOADED: {
                          target: 'postLocation',
                        }
                      }
                    },
                    postLocation: {
                      invoke: {
                        src: 'postLocation',
                        onDone: 'success',
                      }
                    },
                    success: { type: 'final' },
                  }
                },
                setupClient: {
                  initial: 'createClient',
                  states: {
                    createClient: {
                      entry: ['createClient'],
                      on: {
                        CLIENT_CREATED: {
                          target: 'configureClient',
                        },
                      },
                    },
                    configureClient: {
                      on: {
                        CLIENT_CONFIGURED: 'success',
                      }
                    },
                    success: { type: 'final' },
                  }
                },
                loadAppData: {
                  initial: 'start',
                  states: {
                    start: {
                      entry: ['loadAppData'],
                      on: {
                        APP_DATA_SUCCESS: 'success',
                      },
                    },
                    success: { type: 'final' },
                  }
                },
              },
              onDone: 'finish',
            },
            finish : {type: 'final'}
          },
          onDone: 'subscribe',
        },
        subscribe: {
          type: 'parallel',
          states: {
            subToChatNotifications: {
              initial: 'start',
              states: {
                start: {
                  on: {
                    SUBBED_TO_CHAT_NOTIF: {
                      target: 'success',
                    }
                  }
                },
                success: { type: 'final' },
              }
            },
          },
          onDone: 'ready',
        },
        ready: {},
      },
    },

    views: {
      initial: 'app',
      states: {
        app: {
          on: {
            CHAT_TRANS: {
              target: 'chat',
            }
          }
        },
        chat: {
          on: {
            EXITED: {
              target: 'app',
            }
          }
        },
      }
    }
  },
});
