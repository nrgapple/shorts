import React, { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import Menu from './components/Menu';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import MainTabs from './pages/MainTabs';
import { connect } from './data/connect';
import { AppContextProvider } from './data/AppContext';
import { loadConfData, loadAllInfo, addChat, removeChat, replaceChat } from './data/sessions/sessions.actions';
import { setIsLoggedIn, setUsername, loadUserData, setToken, loadCurrentLocation, setIsClientConnected, setClient } from './data/user/user.actions';
import Account from './pages/Account';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Support from './pages/Support';
import Tutorial from './pages/Tutorial';
import UserProfile from './pages/UserProfile';
import HomeOrLogin from './components/HomeOrLogin';
import { Session } from "./models/Session";
import { Profile } from './models/Profile';
import { postUserLocation, configureClient, subscribeToChatNotifications } from './data/dataApi';
import { GeoPoint } from './models/GeoPoint';
import ChatDetail from './pages/ChatDetail';
import ProfileDetail from './pages/ProfileDetail';
import { Client } from '@stomp/stompjs';

const App: React.FC = () => {
  return (
    <AppContextProvider>
      <IonicAppConnected />
    </AppContextProvider>
  );
};

interface StateProps {
  darkMode: boolean,
  token?: string,
  userProfile?: Profile,
  nearMe?: Profile[],
  location?: GeoPoint,
  client?: Client,
  isClientConnected: boolean,
}

interface DispatchProps {
  loadConfData: typeof loadConfData;
  loadUserData: typeof loadUserData;
  loadCurrentLocation: typeof loadCurrentLocation
  setIsLoggedIn: typeof setIsLoggedIn;
  setUsername: typeof setUsername;
  setToken: typeof setToken;
  loadAllInfo: typeof loadAllInfo;
  setIsClientConnected: typeof setIsClientConnected,
  setClient: typeof setClient,
  replaceChat: typeof replaceChat,
}

interface IonicAppProps extends StateProps, DispatchProps { }

const IonicApp: React.FC<IonicAppProps> = ({ 
  darkMode, 
  token, 
  userProfile, 
  nearMe, 
  location, 
  client,
  loadAllInfo, 
  setIsLoggedIn, 
  setUsername, 
  setClient,
  setToken, 
  loadConfData, 
  loadUserData, 
  loadCurrentLocation, 
  isClientConnected,
  replaceChat,
}) => {

  const configure = () => {
    if (token && client) {
      configureClient(
        token,
        client,
        () => {
          setIsClientConnected(true);
          console.log(`Connected to socket`);
          subscribeToChatNotifications(
            client,
            (chat) => {
                chat.lastMessage && console.log(`New message from ${chat.recipient.firstName}: ${chat.lastMessage.content}`);
                replaceChat(chat);
              },
            `notify-chat-${userProfile!.userId}`,
            );
        },
        () => {
          console.log(`Client disconnected`);
        },
        () => {
        },
        () => {
        }
      );
    }
  }

  useEffect(() => {
    loadUserData();
    console.log("here");
    loadCurrentLocation();
    // eslint-disable-next-line
    return () => {
      if (client) {
        client.deactivate();
        setClient(undefined);
        setIsClientConnected(false);
      }
    }
  }, []);

  useEffect(() => {
    console.log(token);
    loadConfData();
    setClient(new Client());
    //loadAllInfo(token);
    console.log(userProfile);
  }, [token])
  
  useEffect(() => {
    console.log(token);
    console.log(userProfile);
    console.log(nearMe);
  }, [userProfile])

  useEffect(() => {
    console.log(`About post location: token: ${token} -- ${location?location.lat:null}`);
    if (location)
      postUserLocation(location, token);
  }, [location])

  useEffect(() => {
    console.log(`client changed: ${client}`);
    if (!client || isClientConnected || !userProfile) return;
    console.log(`Now time to configure`);
    configure();
  }, [client, userProfile])

  return (
    <IonApp className={`${darkMode ? 'dark-theme' : ''}`}>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <IonRouterOutlet id="main">
            <Route path="/tabs" component={MainTabs} />
            <Route path="/account" component={Account} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/support" component={Support} />
            <Route path="/profile" component={UserProfile} />
            <Route path="/tutorial" component={Tutorial} />
            <Route path="/logout" render={() => {
              setIsLoggedIn(false);
              setUsername(undefined);
              setToken(undefined);
              return <Redirect to="/tabs" />
            }} />
            <Route path="/chat/:id" component={ChatDetail} />
            <Route path="/more/:id" component={ProfileDetail} />
            <Route path="/" component={HomeOrLogin} exact />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  )
}

export default App;

const IonicAppConnected = connect<{}, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    darkMode: state.user.darkMode,
    sessions: state.data.sessions,
    token: state.user.token,
    userProfile: state.data.userProfile,
    nearMe: state.data.nearMe,
    location: state.user.location,
    client: state.user.client,
    isClientConnected: state.user.isClientConnected,
  }),
  mapDispatchToProps: { 
    loadConfData, 
    loadUserData, 
    setIsLoggedIn, 
    setIsClientConnected, 
    setUsername, 
    setToken, 
    loadCurrentLocation, 
    loadAllInfo,
    setClient,
    replaceChat,
  },
  component: IonicApp
});
