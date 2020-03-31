import React from 'react';
import { connect } from '../data/connect';
import { Redirect } from 'react-router';

interface StateProps {
  hasSeenTutorial: boolean;
  token?: string;
}

const HomeOrLogin: React.FC<StateProps> = ({ hasSeenTutorial, token }) => {
  return token ? <Redirect to="/tabs/home" /> : <Redirect to="/login" />
};

export default connect<{}, StateProps, {}>({
  mapStateToProps: (state) => ({
    hasSeenTutorial: state.user.hasSeenTutorial,
    token: state.user.token
  }),
  component: HomeOrLogin
});