export const vars = () => ({
  "env": {
    "SOCKET_URL": "wss://selfconnect.dev/ws",
    "API_URL": "https://selfconnect.dev",
    "CHAT": "/topic/chat-",
    "TYPE": "/user/queue/typing-",
    "READ": "/user/queue/read-",
    "MATCH_NOTIFY": "/user/queue/notification-match",
    "CHAT_NOTIFY": "/user/queue/notification-chat",
    "PUBLISH_MESSAGE": "/app/message",
    "PUBLISH_TYPING": "/app/typing",
    "PUBLISH_READ": "/app/read"
  }
});

// reference it:
// vars.env.VARIABLE_NAME
//`${CHAT_CHAT_ID}${1234}`