import { SessionsActions } from './sessions.actions';
import { SessionsState } from './sessions.state';
import { Chat } from '../../models/Chat';

export const sessionsReducer = (state: SessionsState, action: SessionsActions): SessionsState => {
  switch (action.type) {
    case 'set-conf-loading': {
      return { ...state, loading: action.isLoading };
    }
    case 'set-conf-data': {
      return { ...state, ...action.data };
    }
    case 'add-favorite': {
      return { ...state, favorites: [...(state.favorites), action.sessionId] };
    }
    case 'remove-favorite': {
      return { ...state, favorites: [...(state.favorites).filter(x => x !== action.sessionId)] };
    }
    case 'add-chat': {
      return { ...state, chats: [...(state.chats), action.chat] };
    }
    case 'remove-chat': {
      return { ...state, chats: state.chats?[...(state.chats).filter(x => x.chatId !== action.chat.chatId)]:undefined };
    }
    case 'replace-chat': {
      return { ...state, chats: state.chats?[...(state.chats).filter(x => x.chatId !== action.chat.chatId), action.chat]:undefined };
    }
    case 'add-match': {
      return { ...state, matches: [...(state.matches), action.match] };
    }
    case 'remove-match': {
      return { ...state, matches: state.matches?[...(state.matches).filter(x => x.userId !== action.match.userId)]:undefined};
    }
    case 'update-filtered-tracks': {
      return { ...state, filteredTracks: action.filteredTracks };
    }
    case 'set-search-text': {
      return { ...state, searchText: action.searchText };
    }
    case 'increment-profile-index': {
      return { ...state, currentProfileIndex: state.currentProfileIndex + 1};
    }
    case 'set-has-valid-profile': {
      return { ...state, hasValidProfile: action.isValid }
    }
  }
}