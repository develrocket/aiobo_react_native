import * as ActionTypes from '../actions/ActionTypes';
import axios from 'react-native-axios';

const defaultState = {
    isLoggedIn: false,
    username: '',
    password: '',
    authToken: '',
    roles: []
};

export default function reducer(state = defaultState, action) {
    switch (action.type) {
        case ActionTypes.LOGIN:
            axios.defaults.headers.common['AIOBO-TOKEN'] = action.authToken;

            return Object.assign({}, state, {
                isLoggedIn: true,
                username: action.username,
                password: action.password,
                authToken: action.authToken,
                roles: action.roles
            });
        case ActionTypes.LOGOUT:
            return Object.assign({}, state, {
                isLoggedIn: false,
                username: '',
                password: '',
                authToken: '',
                roles: []
            });
        default:
            return state;
    }
}