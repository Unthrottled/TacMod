const AuthReducer = (state = {}, action) => {
  switch (action.type) {
    case 'LOGIN':
      const {accessToken, refreshToken, idToken} = action.payload;
      return {
        ...state,
        accessToken,
        refreshToken,
        idToken
      };
    default:
      return state;

  }
};

export default AuthReducer;