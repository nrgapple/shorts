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
import { loadAllInfo, replaceChat } from './data/sessions/sessions.actions';
import { setIsLoggedIn, setUsername, loadUserData, setToken, loadCurrentLocation, setIsClientConnected, setClient, setVisibility } from './data/user/user.actions';
import Account from './pages/Account';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Support from './pages/Support';
import Tutorial from './pages/Tutorial';
import UserProfile from './pages/UserProfile';
import HomeOrLogin from './components/HomeOrLogin';
import { Profile } from './models/Profile';
import { postUserLocation } from './data/dataApi';
import { GeoPoint } from './models/GeoPoint';
import ChatDetail from './pages/ChatDetail';
import ProfileDetail from './pages/ProfileDetail';
import { Client } from '@stomp/stompjs';
import Connections from './components/Connections';
import Forgot from './pages/Forgot';
import Reset from './pages/Reset';
import Download from './pages/Download';

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
  visibility?: string,
}

interface DispatchProps {
  loadUserData: typeof loadUserData;
  loadCurrentLocation: typeof loadCurrentLocation
  setIsLoggedIn: typeof setIsLoggedIn;
  setUsername: typeof setUsername;
  setToken: typeof setToken;
  loadAllInfo: typeof loadAllInfo;
  setIsClientConnected: typeof setIsClientConnected,
  setClient: typeof setClient,
  replaceChat: typeof replaceChat,
  setVisibility: typeof setVisibility,
}

interface IonicAppProps extends StateProps, DispatchProps { }

const IonicApp: React.FC<IonicAppProps> = ({ 
  darkMode, 
  token, 
  client,
  loadAllInfo, 
  setIsLoggedIn, 
  setUsername, 
  setClient,
  setToken, 
  loadUserData, 
  setIsClientConnected,
  setVisibility,
  visibility,
}) => {

  useEffect(() => {
    setVisibility('visible');
    document.addEventListener("visibilitychange", loadVisibility);
    loadUserData();
    return () => {
      if (client) {
        client.deactivate();
        setClient(undefined);
        setIsClientConnected(false);
      }
      document.removeEventListener("visibilitychange", loadVisibility)
    }
  }, []);

  const loadVisibility = () => {
    setVisibility(document.visibilityState);
  }

  useEffect(() => {
    loadAllInfo();
  }, [token])

  useEffect(() => {
    if (visibility === 'visible' && client && !client.connected) {
      loadAllInfo();

    }
  }, [visibility, client])

  return (
    <IonApp className={`${darkMode ? 'dark-theme' : ''}`}>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <Connections />
          <IonRouterOutlet id="main">
            <Route path="/tabs" render={() => {
                return <MainTabs hasMessages={false} />
              }}
            />
            <Route path="/account" component={Account} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/support" component={Support} />
            <Route path="/profile" component={UserProfile} />
            <Route path="/tutorial" component={Tutorial} />
            <Route path="/forgot" component={Forgot} />
            <Route path="/reset" component={Reset} />
            <Route path="/download" component={Download} />
            <Route path="/chat/:id" component={ChatDetail} />
            <Route path="/more/:id" component={ProfileDetail} />
            <Route path="/logout" render={() => {
              setIsLoggedIn(false);
              setUsername(undefined);
              setToken(undefined);
              return <Redirect to="/tabs" />
            }} />
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
    visibility: state.user.visibility,
  }),
  mapDispatchToProps: { 
    loadUserData, 
    setIsLoggedIn, 
    setIsClientConnected, 
    setUsername, 
    setToken, 
    loadCurrentLocation, 
    loadAllInfo,
    setClient,
    replaceChat,
    setVisibility,
  },
  component: IonicApp
});
