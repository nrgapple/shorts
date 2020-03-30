import { Plugins, Geolocation } from '@capacitor/core';
import Axios from 'axios';
import { Profile } from '../models/Profile';
import { Image } from '../models/Image';
import { GeoPoint } from '../models/GeoPoint';
import { Message } from '../models/Message';
import { Chat } from '../models/Chat';
import { StompHeaders, Client } from '@stomp/stompjs';
import moment from 'moment';
import { vars } from './env';

const { Storage } = Plugins;

const HAS_LOGGED_IN = 'hasLoggedIn';
const HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
const USERNAME = 'username';
const TOKEN = 'token';
const DARK_MODE = 'darkMode';
const LOCATION = 'location';


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

export const getNearMe = async (token: string | undefined) => {
  if (token) {
    try {
      const nearMeResponse = await Axios.request({
        url: `${vars().env.API_URL}/secure/profiles`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      const { data: nearMeData } = nearMeResponse;
      const nearMe = nearMeData.map((Profile: any) : Profile => {
        return {
          userId: Profile.userId as number, 
          firstName: Profile.firstName as string,
          lastName: Profile.lastName as string,
          about: Profile.about as string,
          height: Profile.height as number,
          dob: moment(Profile.dob).toDate() as Date,
          username: Profile.username as string,
          images: Profile.images.map((image: any) : Image => {
            return {
              imageId: image.imageId,
              imageUrl: image.imageUrl,
            }
          }),
          gender: Profile.gender? Profile.gender.toLowerCase(): undefined,
          genderPref: Profile.genderPref? Profile.genderPref.toLowerCase(): undefined,
          displayAddress: Profile.displayAddress,
          distance: Profile.distance,
        }
      }) as Profile[];
      return nearMe;
    } catch (e) {
      const {data} = e.response
      throw data;
    }
  } 
}

export const getUserProfile = async (token: string | undefined) => {
  if (token) {
    try {
      const userProfileResponse = await Axios.request({
        url: `${vars().env.API_URL}/secure/profile`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      const { data: userProfileData } = userProfileResponse;
      const userProfile = {
        userId: userProfileData.userId as number, 
        firstName: userProfileData.firstName as string,
        lastName: userProfileData.lastName as string,
        about: userProfileData.about as string,
        height: userProfileData.height as number,
        dob: moment(userProfileData.dob).toDate() as Date,
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
        searchMiles: userProfileData.miles,
      } as Profile;
      return userProfile;
    } catch (e) {
      const {data} = e.response;
      throw data? data: e.response;
    }
  }
}

export const getCurrentLocation = async () => {
  try {
    const geoPostion = Geolocation.getCurrentPosition();
    return geoPostion;
  } catch (e) {
    console.error(e);
  }  
}

export const postLogin = async (
  username: string,
  password: string,
) => {
  try {
    const response = await Axios.request({
      url: `${vars().env.API_URL}/public/login`,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: {
        username: username, 
        password: password,
      }
    });
    const { data } = response;
    return data;
  } catch (e) {
    const {data} = e.response;
    throw data
  }
}

export const postForgot = async (
  email: string,
) => {
  try {
    const response = await Axios.request({
      url: `${vars().env.API_URL}/public/credentials/forgot`,
      method: 'POST',
      data: {
        email
      },
      headers: {
        'Content-Type': 'application/json'
      },
    });
    const { data } = response;
    return data;
  } catch (e) {
    const {data} = e.response;
    throw data
  }
}

export const getVerify = async (
  token: string,
) => {
  try {
    const response = await Axios.request({
      url: `${vars().env.API_URL}/public/credentials/verify/${token}`,
      method: 'GET',
    });
    return response;
  } catch (e) {
    const {data} = e.response;
    throw data
  }
}

export const postReset = async (
  token: string,
  password: string,
) => {
  try {
    const response = await Axios.request({
      url: `${vars().env.API_URL}/public/credentials/reset`,
      method: 'POST',
      data: {
        token: token,
        password: password,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    const { data } = response;
    return data;
  } catch (e) {
    const {data} = e.response;
    throw data
  }
}

export const postProfileInfo = async (
  token: string | undefined,
  about: string,
  gender: string,
  genderPref: string,
  height: number,
  miles: number,
) => {
  if (!token) {
    return
  } 
  try {
    const response = await Axios.request({
      url: `${vars().env.API_URL}/secure/profile`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        data: {
          about: about,
          gender: gender.toUpperCase(),
          genderPref: genderPref.toUpperCase(),
          height: height,
          miles: miles,
        }
    });
    const {data} = response;
    const updatedProfile = {
      userId: data.userId as number, 
      firstName: data.firstName as string,
      lastName: data.lastName as string,
      about: data.about as string,
      height: data.height as number,
      dob: moment(data.dob).toDate() as Date,
      username: data.username as string,
      gender: data.gender.toLowerCase() as string,
      genderPref: data.genderPref.toLowerCase() as string,
      images: data.images.map((image: any) : Image => {
        return {
          imageId: image.imageId,
          imageUrl: image.imageUrl,
        }
      }),
      searchMiles: data.miles,
      displayAddress: data.displayAddress,
    } as Profile;
    return updatedProfile;
  } catch (e) {
    const {data} = e.response;
    throw data;
  }
}

export const postSignup = async (
  username: string,
  password: string,
  dob: string,
  firstName: string,
  lastName: string,
  email: string,
) => {
  try {
    const response = await Axios.request({
      url: `${vars().env.API_URL}/public/signup`,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: {
        username: username, 
        password: password,
        dob: dob.toString(),
        firstName: firstName,
        lastName: lastName,
        email: email,
      }
    });
    const {data} = response;
    return data;
  } catch (e) {
    return e.response;
  }
}

export const postUserLocation = async (point: GeoPoint, token: string | undefined) =>
{
  if (token)
  {
    try {
      const sendLocationResponse = await Axios.request({
        url: `${vars().env.API_URL}/secure/location`,
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
      return data as Profile;
    } catch (e) {
      console.log(e);
    }
  }
} 

export const postSwipe = async (userId: number, liked: boolean, token: string | undefined) => {
  if (token) {
    try {
      const swipeResponse = await Axios.request({
        url: `${vars().env.API_URL}/secure/swipe`,
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
      return data.wasMatched as boolean
    } catch (e) {
      console.log(`Error posting swipe: ${e}`);
      const {data} = e.response;
      throw data;
    }
  }
}

export const getMatches = async (token: string | undefined) => {
  if (token) {
    try {
      const matchesResponse = await Axios.request({
        url: `${vars().env.API_URL}/secure/matches`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const { data } = matchesResponse;
      return data.matches as Profile[];
    } catch (e) {
      console.log(`Error posting swipe: ${e}`);
      throw e.response?e.response: e;
    }
  }
}

export const postImage = async (image:File, token:string | undefined) => {
  if (token) {
    try {
      var formData = new FormData();
      formData.append("image", image);
      const imageResponse = await Axios.request({
        url: `${vars().env.API_URL}/secure/image`,
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
      throw e;
    }
  }
}

export const deleteImage = async (imageId: number, token: string | undefined) => {
  if (token) {
    try {
      const deleteResponse = await Axios.request({
        url: `${vars().env.API_URL}/secure/image/${imageId}`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const {data} = deleteResponse;
      return data;
    } catch (e) {
      throw e;
    }
  }
}

export const deleteMatch = async (userId: number, token: string | undefined) => {
  if (token) {
    try {
      const deleteResponse = await Axios.request({
        url: `${vars().env.API_URL}/secure/unmatch/${userId}`,
        method: `POST`,
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const {data} = deleteResponse;
      return data;
    } catch (e) {
      throw e;
    }
  }
}

export const getMessages = async (chatId: number, token: string | undefined) => {
  if (token) {
    try {
      const messagesResponse = await Axios.request({
        url: `${vars().env.API_URL}/secure/messages/${chatId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const { data } = messagesResponse;
      return {
        lastReadMessageId: data.lastReadMessageId as number,
        messages: data.messages.map((message:any) : Message => {
          return {
            fromUserId: message.fromUserId as number,
            firstName: message.firstName as string,
            lastName: message.lastName as string,
            content: message.content as string,
            createdAt: moment(message.createdAt).toDate() as Date,
            messageId: message.messageId,
          }
        }) as Message[]
      };
      
      
    } catch (e) {
      const {data} = e.response;
      throw data
    }
  }
}

export const createChat = async (userId: number, token: string | undefined) => {
  if (token) {
    try {
      const chatsResponse = await Axios.request({
        url: `${vars().env.API_URL}/secure/chat/${userId}`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const { data } = chatsResponse;
      return {
        chatId: data.chatId,
        recipient: data.recipient,
      } as Chat;
    } catch (e) {
      const {data} = e.response;
      return data;
    }
  }
}

export const getChats = async (token: string | undefined) => {
  if (token) {
    try {
      const chatsResponse = await Axios.request({
        url: `${vars().env.API_URL}/secure/chats`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const { data } = chatsResponse;
      return data.map((chat: any) : Chat => ({
        chatId: chat.chatId,
        recipient: chat.recipient,
        lastMessage: chat.lastMessage? {
          content: chat.lastMessage.content,
          firstName: chat.lastMessage.firstName,
          lastName: chat.lastMessage.lastName,
          fromUserId: chat.lastMessage.fromUserId,
          createdAt: moment(chat.lastMessage.createdAt).toDate() as Date,
        } as Message : undefined,
        hasUnreadMessages: chat.hasUnreadMessages,
      } as Chat));
    } catch (e) {
      const { data } = e;
      throw data;
    }
  }
}

export const postDevice = async (key: string, auth: string, endpoint: string, token: string) => {
  if (key && auth && endpoint && token) {
    try {
      const postDeviceResponse = await Axios.request({
        url: `${vars().env.API_URL}/secure/device/add`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        data: {
          endPoint: endpoint,
          key: key,
          auth: auth,
          deviceType: 'DESKTOP'
        }
      });
      const { data } = postDeviceResponse;
    } catch(e) {
      const { data } = e;
      throw data;
    }
  }
}

export const configureClient = (
  token: string | undefined, 
  client: Client | undefined,
  onConnect: ()=> void,
  onDisconnect: () => void,
  onWebSocketClose: () => void,
  onWebSocketError: () => void,
  ) => {
  if (!token || !client) 
    return;
  if (client.connected)
    return;
  const stompHeader = new StompHeaders();
  stompHeader.Authorization = `Bearer ${token}`;
  client.configure({
    brokerURL: vars().env.SOCKET_URL,
    connectHeaders: stompHeader,
    onConnect: () => {
      onConnect();
    },
    onDisconnect: () => {
      console.log(`disconnected`);
      onDisconnect();
    },
    onWebSocketClose: () => {
      console.log(`web socket closed`);
      onWebSocketClose();
    },
    onWebSocketError: (e) => {
      console.log(`web socket error: ${e}`);
      onWebSocketError();
    }
  });
  client.activate();
}

export const subscribeToChatMessages = (
  client: Client,
  chatId: number,
  onMessage: (msg: Message) => void,
  subId: string,
) => {
  return client.subscribe(`${vars().env.CHAT}${chatId}`, response => {
    const data = JSON.parse(response.body);
    
    if (data) {
      onMessage({
        content: data.content as string,
        createdAt: moment(data.createdAt).toDate() as Date,
        fromUserId: data.fromUserId,
        firstName: data.firstName,
        lastName: data.lastName,
        messageId: data.messageId,
      } as Message);
    }
  }, {id: subId} as StompHeaders);
}

export const subscribeToTypingForClient = (
  client: Client,
  chatId: number,
  onTyping: (isTyping: boolean) => void,
  subId: string,
) => {
  return client.subscribe(`${vars().env.TYPE}${chatId}`, response => {
    const data = JSON.parse(response.body);
    if (data) {
      onTyping(data.typing as boolean);
    }
  }, {id: subId} as StompHeaders);
}

export const subscribeToChatRead = (
  client: Client,
  chatId: number,
  onRead: (msgId: number) => void,
  subId: string,
) => {
  return client.subscribe(`${vars().env.READ}${chatId}`, response => {
    const data = JSON.parse(response.body);
    
    if (data) {
      onRead(data.lastReadMessageId);
    }
  }, {id: subId} as StompHeaders);
}

export const subscribeToChatNotifications = (
  client: Client,
  onNotification: (chat: Chat) => void,
  subId: string,
) => {
  return client.subscribe(vars().env.CHAT_NOTIFY, response => {
    const data = JSON.parse(response.body);
    if (data) {
      onNotification({
          ...data,
          lastMessage: {
            content: data.lastMessage.content,
            firstName: data.lastMessage.firstName,
            lastName: data.lastMessage.lastName,
            fromUserId: data.lastMessage.fromUserId,
            createdAt: moment(data.lastMessage.createdAt).toDate() as Date,
          } as Message
      });
    }
  }, {id: subId} as StompHeaders);
}

export const subscribeToMatchNotifications = (
  client: Client,
  onNotification: (profile: Profile) => void,
  subId: string,
) => {
  return client.subscribe(vars().env.MATCH_NOTIFY, response => {
    const data = JSON.parse(response.body);
    if (data) {
      if (!data) {
        console.error(`no profile returned`);
        return;
      }
      onNotification(data as Profile);
    }
  }, {id: subId} as StompHeaders);
}

export const subscribeToUnmatchNotifications = (
  client: Client,
  onNotification: (userId: number) => void,
  subId: string,
) => {
  return client.subscribe(vars().env.UNMATCH_NOTIFY, response => {
    const data = JSON.parse(response.body);
    if (data) {
      if (!data.userId) {
        console.error(`no id returned`);
        return;
      }
      onNotification(data.userId as number);
    }
  }, {id: subId} as StompHeaders);
}

export const publishMessageForClient = (
  client: Client,
  chatId: number,
  message: string,
) => {
  if (!chatId)
    return;
  if (!client.connected) {
    return;
  }
  if (client.webSocket.readyState === 1) {
    client.publish({
      destination: `${vars().env.PUBLISH_MESSAGE}/${chatId}`, 
      body: JSON.stringify({message: message})
    });
    return true;
  }
}

export const publishTypingForClient = (
  client: Client,
  chatId: number,
  isTyping: boolean,
) => {
  if (!chatId)
    return;
  if (!client.connected) {
    return;
  }
  if (client.webSocket.readyState === 1) {
    client.publish({
      destination: `${vars().env.PUBLISH_TYPING}/${chatId}`, 
      body: JSON.stringify({typing: isTyping})
    });
    return true;
  }
}

export const publishReadForClient = (
  client: Client,
  messageId: number,
) => {
  if (!client.connected) {
    return;
  }
  if (client.webSocket.readyState === 1) {
    client.publish({
      destination: `${vars().env.PUBLISH_READ}/${messageId}`, 
    });
    return true;
  }
}

export const setIsLoggedInData = async (isLoggedIn: boolean) => {
  await Storage.set({ key: HAS_LOGGED_IN, value: JSON.stringify(isLoggedIn) });
}

export const setHasSeenTutorialData = async (hasSeenTutorial: boolean) => {
  await Storage.set({ key: HAS_SEEN_TUTORIAL, value: JSON.stringify(hasSeenTutorial) });
}

export const setUsernameData = async (username: string | undefined) => {
  if (!username) {
    await Storage.remove({ key: USERNAME });
  } else {
    await Storage.set({ key: USERNAME, value: username });
  }
}

export const setLocationData = async (point: GeoPoint | undefined) => {
  if (!point) {
    await Storage.remove({ key: LOCATION});
  } else {
    await Storage.set({ key: LOCATION, value: JSON.stringify(point)});
  }
}

export const setDarkModeData = async (darkMode: boolean) => {
  await Storage.set({ key: DARK_MODE, value: JSON.stringify(darkMode) })
}

export const setTokenData = async (token: string | undefined) => {
  if (!token) {
    await Storage.remove({ key: TOKEN });
  } else {
    await Storage.set({ key: TOKEN, value: token });
  }
}