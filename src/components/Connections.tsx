import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import { configureClient, subscribeToChatNotifications, subscribeToMatchNotifications } from '../data/dataApi';
import { Profile } from '../models/Profile';
import { Client } from '@stomp/stompjs';
import { setClient, setIsClientConnected } from '../data/user/user.actions';
import { replaceChat } from '../data/sessions/sessions.actions';
import { connect } from '../data/connect';

interface StateProps {
  token?: string,
  userProfile?: Profile,
  client?: Client,
  isClientConnected: boolean,
}

interface DispatchProps {
  setClient: typeof setClient,
  replaceChat: typeof replaceChat,
  setIsClientConnected: typeof setIsClientConnected,
}

interface ConnectionProps extends StateProps, DispatchProps {}

const Connections: React.FC<ConnectionProps> = ({
  token,
  userProfile,
  client,
  isClientConnected,
  setClient,
  setIsClientConnected,
  replaceChat,
}) => {
  const history = useHistory();

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
          subscribeToMatchNotifications(
            client,
            (profile) => {
              console.log(`MATCH!!`);
              console.log(profile);
              history.push(`/more/${profile.userId}`);
            }
          )
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
    console.log(token);
    setClient(new Client());
  }, [token])

  useEffect(() => {
    console.log(`client changed: ${client}`);
    console.log(userProfile);
    if (!client || isClientConnected || !userProfile) return;
    console.log(`Now time to configure`);
    configure();
  }, [client, userProfile])

  return (
    <>
    </>
  );
};

export default connect<{}, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    token: state.user.token,
    userProfile: state.data.userProfile,
    client: state.user.client,
    isClientConnected: state.user.isClientConnected,
  }),
  mapDispatchToProps: {
    setClient,
    replaceChat,
    setIsClientConnected,
  },
  component: Connections,
});
