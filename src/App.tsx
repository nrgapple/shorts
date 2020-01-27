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
import { loadConfData, loadAllInfo } from './data/sessions/sessions.actions';
import { setIsLoggedIn, setUsername, loadUserData, setToken, loadCurrentLocation } from './data/user/user.actions';
import Account from './pages/Account';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Support from './pages/Support';
import Tutorial from './pages/Tutorial';
import About from './pages/About';
import HomeOrTutorial from './components/HomeOrTutorial';
import { Session } from "./models/Session";
import { Profile } from './models/Profile';
import { postUserLocation } from './data/dataApi';
import { GeoPoint } from './models/GeoPoint';

const App: React.FC = () => {
  return (
    <AppContextProvider>
      <IonicAppConnected />
    </AppContextProvider>
  );
};

interface StateProps {
  darkMode: boolean,
  sessions: Session[],
  token?: string,
  userProfile?: Profile,
  nearMe?: Profile[],
  location?: GeoPoint,
}

interface DispatchProps {
  loadConfData: typeof loadConfData;
  loadUserData: typeof loadUserData;
  loadCurrentLocation: typeof loadCurrentLocation
  setIsLoggedIn: typeof setIsLoggedIn;
  setUsername: typeof setUsername;
  setToken: typeof setToken;
  loadAllInfo: typeof loadAllInfo;
}

interface IonicAppProps extends StateProps, DispatchProps { }

const IonicApp: React.FC<IonicAppProps> = ({ darkMode, sessions, token, userProfile, nearMe, location, loadAllInfo, setIsLoggedIn, setUsername, setToken, loadConfData, loadUserData, loadCurrentLocation }) => {

  useEffect(() => {
    loadUserData();
    console.log("here");
    loadCurrentLocation();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log(token);
    loadConfData();
    loadAllInfo(token);
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

  return (
    sessions.length === 0 ? (
      <div></div>
    ) : (
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
                <Route path="/profile" component={About} />
                <Route path="/tutorial" component={Tutorial} />
                <Route path="/logout" render={() => {
                  setIsLoggedIn(false);
                  setUsername(undefined);
                  setToken(undefined);
                  return <Redirect to="/tabs" />
                }} />
                <Route path="/" component={HomeOrTutorial} exact />
              </IonRouterOutlet>
            </IonSplitPane>
          </IonReactRouter>
        </IonApp>
      )
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
    location: state.user.location
  }),
  mapDispatchToProps: { loadConfData, loadUserData, setIsLoggedIn, setUsername, setToken, loadCurrentLocation, loadAllInfo,},
  component: IonicApp
});
