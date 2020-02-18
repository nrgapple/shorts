export interface ChatStateSchema {
  states: {
    init: {
      states: {
        wait: {},
        fetchMessages: {
          states: {
            loadMessages: {},
            finish: {},
          }
        },
        finish: {},
      }
    };
    subscribe: {
      states: {
        subToChat: {
          states: {
            start: {},
            success: {},
          }
        },
        subToTyping: {
          states: {
            start: {},
            success: {},
          }
        },
        subToRead: {
          states: {
            start: {},
            sendRead: {},
            success: {},
          }
        },
      },
    };
    ready: {
      states: {
        user: {
          states: {
            idle: {},
            sendMessage: {},
            typing: {},
          },
        },
        recipientTyping: {
          states: {
            idle: {},
            typing: {},
          }
        },
        recipientMessages: {
          states: {
            idle: {},
            incomingMessage: {},
          }
        },
        read: {
          states: {
            idle: {},
            updatingLastRead: {},
          }
        }
      }
    },
  };
}