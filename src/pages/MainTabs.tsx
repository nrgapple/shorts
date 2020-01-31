import React  from 'react';
import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { home, heart, chatboxes } from 'ionicons/icons';
import Home from './Home';
import MatchesList from './MatchesList';
import ChatsList from './ChatsList';
import ProfileDetail from './ProfileDetail';

interface MainTabsProps { }

const MainTabs: React.FC<MainTabsProps> = () => {

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path="/tabs" to="/tabs/home" />
        {/* 
          Using the render method prop cuts down the number of renders your components will have due to route changes.
          Use the component prop when your component depends on the RouterComponentProps passed in automatically.        
        */}
        <Route path="/tabs/home" render={() => <Home />} exact={true} />
        <Route path="/tabs/matches" component={MatchesList} exact />
        <Route path="/tabs/chats" component={ChatsList} exact />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/tabs/home">
          <IonIcon icon={home} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="matches" href="/tabs/matches">
          <IonIcon icon={heart} />
          <IonLabel>Matches</IonLabel>
        </IonTabButton>
        <IonTabButton tab="chats" href="/tabs/chats">
          <IonIcon icon={chatboxes} />
          <IonLabel>Chats</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default MainTabs;