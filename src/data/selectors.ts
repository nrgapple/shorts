import { createSelector } from 'reselect';
import { parseISO as parseDate } from 'date-fns';
import { Session } from '../models/Session';
import { SessionGroup } from '../models/SessionGroup';
import { AppState } from './state';

const getSessions = (state: AppState) => state.data.sessions;
export const getSpeakers = (state: AppState) => state.data.speakers;
const getFilteredTracks = (state: AppState) => state.data.filteredTracks;
const getFavoriteIds = (state: AppState) => state.data.favorites;
const getSearchText = (state: AppState) => state.data.searchText;
const getNearMe = (state: AppState) => state.data.nearMe;
const getCurrentProfileIndex = (state: AppState) => state.data.currentProfileIndex;
const getChats = (state: AppState) => state.data.chats;
const getMatches = (state: AppState) => state.data.matches;
const getAllProfiles = (state: AppState) => state.data.nearMe && state.data.matches ?[...state.data.matches, ...state.data.nearMe] : undefined;

export const getFilteredSessions = createSelector(
  getSessions, getFilteredTracks,
  (sessions, filteredTracks) => {
    return sessions.filter(session => {
      let include = false;
      session.tracks.forEach(track => {
        if (filteredTracks.indexOf(track) > -1) {
          include = true;
        }
      });
      return include;
    });
  }
);

export const getSearchedSessions = createSelector(
  getFilteredSessions, getSearchText,
  (sessions, searchText) => {
    if (!searchText) {
      return sessions;
    }
    return sessions.filter(session => session.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1);
  }
)

export const getGroupedSessions = createSelector(
  getSearchedSessions,
  (sessions) => {
    return groupSessions(sessions);
  }
);

export const getFavorites = createSelector(
  getSearchedSessions, getFavoriteIds,
  (sessions, favoriteIds) => sessions.filter(x => favoriteIds.indexOf(x.id) > -1)
);

export const getGroupedFavorites = createSelector(
  getFavorites,
  (sessions) => {
    return groupSessions(sessions);
  }
)

export const getHasMessages = createSelector(
  getChats,
  (chats) => {
    return chats?chats.some(x => x.hasUnreadMessages):false
  }
)

const getIdParam = (_state: AppState, props: any) => {
  const stringParam = props.match.params['id'];
  return parseInt(stringParam, 10);
}

export const getSession = createSelector(
  getSessions, getIdParam,
  (sessions, id) => sessions.find(x => x.id === id)
);

export const getChat = createSelector(
  getChats, getIdParam,
  (chats, id) => chats?chats.find(x => x.chatId === id):undefined,
);

export const getProfile = createSelector(
  getAllProfiles, getIdParam,
  (allProfiles, id) => allProfiles?allProfiles.find(x => x.userId === id): undefined,
)

function groupSessions(sessions: Session[]) {
  return sessions
    .sort((a, b) => (
      parseDate(a.dateTimeStart).valueOf() - parseDate(b.dateTimeStart).valueOf()
    ))
    .reduce((groups, session) => {
      let starterHour = parseDate(session.dateTimeStart);
      starterHour.setMinutes(0);
      starterHour.setSeconds(0);
      const starterHourStr = starterHour.toJSON();
      const foundGroup = groups.find(group => group.startTime === starterHourStr);
      if (foundGroup) {
        foundGroup.sessions.push(session);
      } else {
        groups.push({
          startTime: starterHourStr,
          sessions: [session]
        });
      }
      return groups;
    }, [] as SessionGroup[]);
}

export const getSpeaker = createSelector(
  getSpeakers, getIdParam,
  (speakers, id) => speakers.find(x => x.id === id)
);

export const getCurrentProfile = createSelector(
  getNearMe, getCurrentProfileIndex,
  (nearMe, index) => {return nearMe && nearMe.length > 0?nearMe[index]:undefined;}
);

export const getMatchesWithoutAChat = createSelector(
  getMatches, getChats,
  (matches, chats) => matches && chats?matches.filter(x => !chats.map(x=>x.recipient.userId).includes(x.userId)): undefined
);

export const getSpeakerSessions = createSelector(
  getSessions,
  (sessions) => {
    const speakerSessions: {[key: number]: Session[]} = {};
    sessions.forEach(session => {
      session.speakerIds.forEach(speakerId => {
        if(speakerSessions[speakerId]) {
          speakerSessions[speakerId].push(session);
        } else {
          speakerSessions[speakerId] = [session];
        }
      })
    });
    return speakerSessions;
  }
);

export const mapCenter = (state: AppState) => {
  const item = state.data.locations.find(l => l.id === state.data.mapCenterId);
  if (item == null) {
    return {
      id: 1,
      name: 'Map Center',
      lat: 43.071584,
      lng: -89.380120
    };
  }
  return item;
}
