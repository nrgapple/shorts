import { getMatches, getUserProfile, getNearMe, getChats, getMessages } from '../dataApi';
import { ActionType } from '../../util/types';
import { SessionsState } from './sessions.state';
import { Profile } from '../../models/Profile';
import { Chat } from '../../models/Chat';

export const loadAllInfo = (token: string | undefined) => async (dispatch: React.Dispatch<any>) => {
  var profile = undefined;
  var matches = undefined;
  var nearMe = undefined;
  try {
    dispatch(setLoading(true));
    profile = await getUserProfile(token);
    matches = await getMatches(token);
  } catch (e) {
    console.log(e);
  }
  try {
    nearMe = await getNearMe(token); 
    dispatch(setHasValidProfile(true));
  } catch (e) {
    console.log(e);
    if (e.code === 400) {
      dispatch(setHasValidProfile(false))
    } 
  } finally {
    dispatch(setData({
      userProfile: profile,
      matches: matches,
      nearMe: nearMe,
    }));
    dispatch(setLoading(false));
  }
}

export const setUserProfile = (profile: Profile) => async (dispatch: React.Dispatch<any>) => {
  console.log('profile')
  dispatch(setLoading(true));
  dispatch(setData({userProfile: profile}));
  dispatch(setLoading(false));
};

export const loadProfile = (token: string | undefined) => async (dispatch: React.Dispatch<any>) => {
  try {
    dispatch(setLoading(true));
    const profile = await getUserProfile(token);
    dispatch(setData({userProfile: profile}));
    dispatch(setLoading(false));
  } catch (e) {
    throw e;
  }
}

export const loadNearMe = (token: string | undefined) => async (dispatch: React.Dispatch<any>) => {
  try {
    dispatch(setLoading(true));
    const nearMe = await getNearMe(token);
    dispatch(setHasValidProfile(true));
    dispatch(setData({nearMe: nearMe}));
  } catch (e) {
    console.log(e);
    if (e.code === "400") {
      dispatch(setHasValidProfile(false))
    }
  } finally {
    dispatch(setLoading(false));
  }
}

export const loadMatches = (token: string | undefined) => async (dispatch: React.Dispatch<any>) => {
  dispatch(setLoading(true));
  const matches = await getMatches(token);
  dispatch(setData({matches: matches}));
  dispatch(setLoading(false));
}

export const loadChats = (token: string | undefined) => async (dispatch: React.Dispatch<any>) => {
  dispatch(setLoading(true));
  const chats = await getChats(token) as Chat[] | undefined;
  if (chats) {
    chats.sort((a: Chat,b: Chat) => {
      if (a.lastMessage === undefined)
        return 1;
      if (b.lastMessage === undefined)
        return -1;
      return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
    });
  }
  dispatch(setData({chats: chats}));
  dispatch(setLoading(false));
}

export const setLoading = (isLoading: boolean) => ({
  type: 'set-conf-loading',
  isLoading
} as const);

export const setHasValidProfile = (isValid: boolean) => ({
  type: 'set-has-valid-profile',
  isValid
} as const);

export const setData = (data: Partial<SessionsState>) => 
{
  return ({
    type: 'set-conf-data',
    data
  } as const);
}

export const addFavorite = (sessionId: number) => ({
  type: 'add-favorite',
  sessionId
} as const);

export const removeFavorite = (sessionId: number) => ({
  type: 'remove-favorite',
  sessionId
} as const);

export const replaceChat = (chat: Chat) => ({
  type: 'replace-chat',
  chat,
} as const);

export const addChat = (chat: Chat) => ({
  type: 'add-chat',
  chat,
} as const);

export const removeChat = (chat: Chat) => ({
  type: 'remove-chat',
  chat
} as const);

export const addMatch = (match: Profile) => ({
  type: 'add-match',
  match,
} as const);

export const removeMatch = (match: Profile) => ({
  type: 'remove-match',
  match
} as const);

export const updateFilteredTracks = (filteredTracks: string[]) => ({
  type: 'update-filtered-tracks', 
  filteredTracks 
} as const);

export const setSearchText = (searchText?: string) => ({ 
  type: 'set-search-text', 
  searchText 
} as const);

export const incrementProfileIndex = () => ({
  type: 'increment-profile-index',
} as const)

export type SessionsActions =
  | ActionType<typeof setLoading>
  | ActionType<typeof setData>
  | ActionType<typeof addFavorite>
  | ActionType<typeof removeFavorite>
  | ActionType<typeof addChat>
  | ActionType<typeof removeChat>
  | ActionType<typeof addMatch>
  | ActionType<typeof removeMatch>
  | ActionType<typeof updateFilteredTracks>
  | ActionType<typeof setSearchText>
  | ActionType<typeof incrementProfileIndex>
  | ActionType<typeof setHasValidProfile>
  | ActionType<typeof replaceChat>
