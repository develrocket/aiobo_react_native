import * as ActionTypes from './ActionTypes';

export const login = (username, password, authToken, roles) => {
    return {
        type: ActionTypes.LOGIN,
        username: username,
        password: password,
        authToken: authToken,
        roles: roles
    };
};

export const logout = () => {
    return {
        type: ActionTypes.LOGOUT
    };
};