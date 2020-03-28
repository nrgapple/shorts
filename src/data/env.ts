export const vars = () => ({
  "env": {
    //routes
    "SOCKET_URL": "wss://selfconnect.dev/ws",
    "API_URL": "https://selfconnect.dev",
    "CHAT": "/topic/chat-",
    "TYPE": "/user/queue/typing-",
    "READ": "/user/queue/read-",
    "MATCH_NOTIFY": "/user/queue/notification-match",
    "UNMATCH_NOTIFY": "/user/queue/notification-unmatch",
    "CHAT_NOTIFY": "/user/queue/notification-chat",
    "PUBLISH_MESSAGE": "/app/message",
    "PUBLISH_TYPING": "/app/typing",
    "PUBLISH_READ": "/app/read",
    // keys
    "APP_SERVER_KEY": "BNuteCIG906sEz67jaqhSAhMuyE2Gff-cjoCy8YIrkSaKK5sIynvmiL9ySN1E0zbI57R2uF1QVhW-Hr3h1TSZ-4"
  }
});

// reference it:
// vars.env.VARIABLE_NAME
//`${CHAT_CHAT_ID}${1234}`