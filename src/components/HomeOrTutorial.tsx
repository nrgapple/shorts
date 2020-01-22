import React from 'react';
import { connect } from '../data/connect';
import { Redirect } from 'react-router';

interface StateProps {
  hasSeenTutorial: boolean;
  token?: string;
}

const HomeOrTutorial: React.FC<StateProps> = ({ hasSeenTutorial, token }) => {
  return hasSeenTutorial ? 
    (token ? <Redirect to="/tabs/home" /> : <Redirect to="/login" />)
    : 
    <Redirect to="/tutorial" />
};

export default connect<{}, StateProps, {}>({
  mapStateToProps: (state) => ({
    hasSeenTutorial: state.user.hasSeenTutorial,
    token: state.user.token
  }),
  component: HomeOrTutorial
});