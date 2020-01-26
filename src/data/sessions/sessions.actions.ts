import { getConfData, getMatches, getUserProfile, getNearMe } from '../dataApi';
import { ActionType } from '../../util/types';
import { SessionsState } from './sessions.state';
import { Profile } from '../../models/Profile';

export const loadConfData = (token?: string) => async (dispatch: React.Dispatch<any>) => {
  dispatch(setLoading(true));
  const data = await getConfData(token);
  const matches = await getMatches(token);
  dispatch(setData({...data, matches: matches}));
  dispatch(setLoading(false));
}

export const setUserProfile = (profile: Profile) => async (dispatch: React.Dispatch<any>) => {
  dispatch(setLoading(true));
  dispatch(setData({userProfile: profile}));
  dispatch(setLoading(false));
};

export const loadProfile = (token?: string) => async (dispatch: React.Dispatch<any>) => {
  dispatch(setLoading(true));
  const profile = await getUserProfile(token);
  dispatch(setData({userProfile: profile}));
  dispatch(setLoading(false));
}

export const loadNearMe = (token?: string) => async (dispatch: React.Dispatch<any>) => {
  dispatch(setLoading(true));
  const nearMe = await getNearMe(token);
  dispatch(setData({nearMe: nearMe}));
  dispatch(setLoading(false));
}

export const setLoading = (isLoading: boolean) => ({
  type: 'set-conf-loading',
  isLoading
} as const);

export const setData = (data: Partial<SessionsState>) => ({
  type: 'set-conf-data',
  data
} as const);

export const addFavorite = (sessionId: number) => ({
  type: 'add-favorite',
  sessionId
} as const);

export const removeFavorite = (sessionId: number) => ({
  type: 'remove-favorite',
  sessionId
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
  | ActionType<typeof updateFilteredTracks>
  | ActionType<typeof setSearchText>
  | ActionType<typeof incrementProfileIndex>
