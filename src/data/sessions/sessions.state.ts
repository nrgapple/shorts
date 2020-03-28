import { Location } from '../../models/Location';
import { Speaker } from '../../models/Speaker';
import { Session } from '../../models/Session';
import { Profile } from '../../models/Profile';
import { Chat } from '../../models/Chat';
export interface SessionsState {
  sessions: Session[];
  speakers: Speaker[];
  favorites: number[];
  locations: Location[];
  filteredTracks: string[];
  searchText?: string;
  mapCenterId?: number;
  loading?: boolean;
  allTracks: string[];

  userProfile?: Profile;
  nearMe?: Profile[];
  matches?: Profile[];
  chats?: Chat[];
  currentProfileIndex: number;
  hasValidProfile: boolean;
}
