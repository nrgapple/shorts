import { Plugins, Geolocation } from '@capacitor/core';
import { Session } from '../models/Session';
import { Speaker } from '../models/Speaker';
import { Location } from '../models/Location';
import Axios from 'axios';
import { Profile } from '../models/Profile';
import { Image } from '../models/Image';
import { male } from 'ionicons/icons';
import { GeoPoint } from '../models/GeoPoint';

const { Storage } = Plugins;

const locationsUrl = '/assets/data/locations.json';
const sessionsUrl = '/assets/data/sessions.json';
const speakersUrl = '/assets/data/speakers.json';
const apiURL = 'https://doctornelson.herokuapp.com';

const HAS_LOGGED_IN = 'hasLoggedIn';
const HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
const USERNAME = 'username';
const TOKEN = 'token';
const DARK_MODE = 'darkMode';
const LOCATION = 'location';

export const getConfData = async (token?: string) => {
  const response = await Promise.all([
    fetch(sessionsUrl),
    fetch(locationsUrl),
    fetch(speakersUrl)]);
  var userProfile = undefined;
  var nearMe = undefined;
  const currentProfile = 0;
  if (token)
  {
    try {
      const userProfileResponse = await Axios.request({
        url: `${apiURL}/secure/profile`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      const { data: userProfileData } = userProfileResponse;
      console.log(userProfileData);
      userProfile = {
        userId: userProfileData.userId as number, 
        firstName: userProfileData.firstName as string,
        lastName: userProfileData.lastName as string,
        about: userProfileData.about as string,
        height: userProfileData.height as number,
        dob: userProfileData.dob as Date,
        username: userProfileData.username as string,
        gender: userProfileData.gender?userProfileData.gender.toLowerCase(): undefined,
        genderPref: userProfileData.gender?userProfileData.genderPref.toLowerCase(): undefined,
        displayAddress: userProfileData.displayAddress?userProfileData.displayAddress: undefined,
        images: userProfileData.images.map((image: any) : Image => {
          return {
            imageId: image.imageId,
            imageUrl: image.imageUrl,
          }
        }),
      } as Profile;
      
      const nearMeResponse = await Axios.request({
        url: `${apiURL}/secure/profiles`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      const { data: nearMeData } = nearMeResponse;
      console.log(nearMeResponse);
      nearMe = nearMeData.map((Profile: any) : Profile => {
        return {
          userId: Profile.userId as number, 
          firstName: Profile.firstName as string,
          lastName: Profile.lastName as string,
          about: Profile.about as string,
          height: Profile.height as number,
          dob: Profile.dob as Date,
          username: userProfileData.username as string,
          images: Profile.images.map((image: any) : Image => {
            return {
              imageId: image.imageId,
              imageUrl: image.imageUrl,
            }
          }),
          gender: Profile.gender? Profile.gender.toLowerCase(): undefined,
          genderPref: Profile.genderPref? Profile.genderPref.toLowerCase(): undefined,
        }
      }) as Profile[];

    } catch (e) {
      console.log(e);
    }
  }
  const sessions = await response[0].json() as Session[];
  const locations = await response[1].json() as Location[];
  const speakers = await response[2].json() as Speaker[];
  const allTracks = sessions
    .reduce((all, session) => all.concat(session.tracks), [] as string[])
    .filter((trackName, index, array) => array.indexOf(trackName) === index)
    .sort();
  const data = {
    sessions,
    locations,
    speakers,
    allTracks,
    filteredTracks: [...allTracks],
    userProfile,
    nearMe,
    currentProfile,
  }
  return data;
}

export const getUserData = async () => {
  const response = await Promise.all([
    Storage.get({ key: HAS_LOGGED_IN }),
    Storage.get({ key: HAS_SEEN_TUTORIAL }),
    Storage.get({ key: USERNAME }),
    Storage.get({ key: TOKEN }),
    Storage.get({ key: DARK_MODE })]);
  const isLoggedin = await response[0].value === 'true';
  const hasSeenTutorial = await response[1].value === 'true';
  const username = await response[2].value || undefined;
  const token = await response[3].value || undefined;
  const darkMode = await response[4].value === 'true';
  const data = {
    isLoggedin,
    hasSeenTutorial,
    username,
    token,
    darkMode
  }
  return data;
}

export const getCurrentLocation = async () => {
  try {
    console.log("getting current location");
    const geoPostion = Geolocation.getCurrentPosition();
    console.log(geoPostion);
    return geoPostion;
  } catch (e) {
    console.error(e);
  }  
}

export const postUserLocation = async (point: GeoPoint, token?: string) =>
{
  console.log(`Posting current location`);
  if (token)
  {
    try {
      const sendLocationResponse = await Axios.request({
        url: `${apiURL}/secure/location`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: {
          longitude: point.lng,
          latitude: point.lat, 
        }
      });
      const { data } = sendLocationResponse;
      console.log(data);
      return data as Profile;
    } catch (e) {
      console.log(e);
    }
  }
} 

export const postSwipe = async (userId: number, liked: boolean, token?: string) => {
  if (token) {
    try {
      const swipeResponse = await Axios.request({
        url: `${apiURL}/secure/swipe`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        data: {
          userId: userId,
          liked: liked, 
        } 
      });
      const { data } = swipeResponse;
      console.log(data);
      return data.wasMatched as boolean
    } catch (e) {
      console.log(`Error posting swipe: ${e}`);
      const {data} = e.response;
      throw data;
    }
  }
}

export const getMatches = async (token?: string) => {
  if (token) {
    try {
      const matchesResponse = await Axios.request({
        url: `${apiURL}/secure/matches`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const { data } = matchesResponse;
      console.log(data);
      return data.matches as Profile[];
    } catch (e) {
      console.log(`Error posting swipe: ${e}`);
      const {data} = e.response;
      throw data;
    }
  }
}

export const postImage = async (image:File, token?:string) => {
  if (token) {
    try {
      var formData = new FormData();
      formData.append("image", image);
      const imageResponse = await Axios.request({
        url: `${apiURL}/secure/image`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        data: formData
      });
      const {data} = imageResponse;
      return data as Image;
    } catch (e) {
      const {data} = e;
      throw e;
    }
  }
}

export const deleteImage = async (imageId: number, token?: string) => {
  if (token) {
    try {
      const deleteResponse = await Axios.request({
        url: `${apiURL}/secure/image/${imageId}`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const {data} = deleteResponse;
      return data;
    } catch (e) {
      const {data} = e;
      throw e;
    }
  }
}

export const setIsLoggedInData = async (isLoggedIn: boolean) => {
  await Storage.set({ key: HAS_LOGGED_IN, value: JSON.stringify(isLoggedIn) });
}

export const setHasSeenTutorialData = async (hasSeenTutorial: boolean) => {
  await Storage.set({ key: HAS_SEEN_TUTORIAL, value: JSON.stringify(hasSeenTutorial) });
}

export const setUsernameData = async (username?: string) => {
  if (!username) {
    await Storage.remove({ key: USERNAME });
  } else {
    await Storage.set({ key: USERNAME, value: username });
  }
}

export const setLocationData = async (point?: GeoPoint) => {
  console.log("setting location data");
  if (!point) {
    await Storage.remove({ key: LOCATION});
  } else {
    await Storage.set({ key: LOCATION, value: JSON.stringify(point)});
  }
}

export const setDarkModeData = async (darkMode: boolean) => {
  await Storage.set({ key: DARK_MODE, value: JSON.stringify(darkMode) })
}

export const setTokenData = async (token?: string) => {
  if (!token) {
    await Storage.remove({ key: TOKEN });
  } else {
    await Storage.set({ key: TOKEN, value: token });
  }
}