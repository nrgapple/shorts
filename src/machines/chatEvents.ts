export type ChatEvent =
  | { type: 'DEPENDENCIES_LOADED', read: boolean, msgId: number}
  | { type: 'SUB_CHAT_SUCCESS', read: boolean, msgId: number}
  | { type: 'SUB_TYPING_SUCCESS' }
  | { type: 'SUB_READ_SUCCESS', msgId: number }
  | { type: 'USER_SENT', msgId: number }
  | { type: 'USER_TYPED', read: boolean, msgId: number }
  | { type: 'USER_STOPPED', msgId: number }
  | { type: 'REC_TYPED', msgId: number }
  | { type: 'REC_STOPPED', msgId: number }
  | { type: 'REC_INCOMING_MSG', read: boolean, msgId: number}
  | { type: 'REC_UPDATED', read: boolean }
  | { type: 'REC_READ', msgId: number }
  | { type: 'READ_UPDATE_SUCCESS' }
