import React, {Component} from "react";
import {Container, Content, Text, List, ListItem, Left, Body} from "native-base";
import Icon from 'react-native-vector-icons/Ionicons';
import s from '../Style';
import {logout} from "../../actions/auth";
import {connect} from 'react-redux';

const routes = [
    {
        routeName: 'Home',
        name: "Home",
        icon: 'md-home'
    },
    {
        routeName: 'Agent',
        name: "View Agents",
        icon: 'md-people'
    },
    {
        routeName: 'SendApplication',
        name: 'Send Agent Application',
        icon: 'md-person-add'
    },
    {
        routeName: 'CreateOrder',
        name: 'Create Order',
        icon: 'ios-send'
    },
    {
        routeName: 'OrderList',
        name: 'View Orders',
        icon: 'md-clipboard'
    },
    {
        routeName: 'TransferInventory',
        name: 'Transfer Inventory',
        icon: 'md-swap'
    },
    {
        routeName: 'AddRMA',
        name: 'Add RMA',
        icon: 'md-add-circle'
    },
    {
        routeName: 'RMAList',
        name: 'RMA List',
        icon: 'md-list'
    },
    {
        routeName: 'TotalBatch',
        name: 'Statements',
        icon: 'logo-usd'
    },
    {
        routeName: 'ActivityReport',
        name: 'Activity Report',
        icon: 'ios-create'
    },
    {
        routeName: 'OnHandReportList',
        name: 'Onhand Items',
        icon: 'md-hand'
    },
    {
        routeName: 'EventList',
        name: 'OK Events',
        icon: 'md-calendar'
    },
    {
        routeName: '',
        name: 'Sign Out',
        icon: 'md-log-out'
    }
];

class SideBar extends Component {
    constructor(props) {
        super(props);
        let newRoutes = routes;
        if (this.props.roles.indexOf('agent_transfer') < 0) {
            newRoutes = this.remoteRoutes(newRoutes, 'TransferInventory');
        }
        if (this.props.roles.indexOf('orders') < 0) {
            newRoutes = this.remoteRoutes(newRoutes, 'CreateOrder');
            newRoutes = this.remoteRoutes(newRoutes, 'OrderList');
        }
        if (this.props.roles.indexOf('referral_code') < 0) {
            newRoutes = this.remoteRoutes(newRoutes, 'SendApplication');
        }
        if (this.props.roles.indexOf('rma_entry') < 0) {
            newRoutes = this.remoteRoutes(newRoutes, 'AddRMA');
            newRoutes = this.remoteRoutes(newRoutes, 'RMAList');
        }
        if (this.props.roles.indexOf('event') < 0) {
            newRoutes = this.remoteRoutes(newRoutes, 'OK Events');
        }
        this.state = {
            routes: newRoutes
        };
    }


    remoteRoutes(routesArray, routeName) {
        let newRoutes = [];
        for (let i = 0; i < routesArray.length; i ++) {
            if (routesArray[i].routeName != routeName) {
                newRoutes.push(routesArray[i]);
            }
        }
        return newRoutes;
    }

    logout() {
        console.log('log-out');
        this.props.logout();
    }

    render() {
        return (
            <Container>
                <Content style={{backgroundColor: '#262626'}}>
                    <Text style={{marginTop: 30, color: '#fff', paddingLeft: 20}}>
                        Welcome
                    </Text>
                    <Text style={{textAlign: 'center', color: '#fff', fontSize: 25, marginTop: 10, marginBottom: 10}}>
                        <Icon name='md-person' style={{fontSize: 25}}/>&nbsp;&nbsp; {this.props.username}
                    </Text>
                    <List
                        style={{width: '100%'}}
                        dataArray={this.state.routes}
                        renderRow={data => {
                            return (
                                <ListItem
                                    icon
                                    onPress={() => {
                                        if (data.routeName) {
                                            this.props.navigation.navigate(data.routeName)
                                        } else {
                                            this.logout();
                                        }
                                    }}>
                                    <Left>
                                        <Icon name={data.icon} style={s.menuIcon}/>
                                    </Left>
                                    <Body>
                                    <Text style={{color: '#fff'}}>{data.name}</Text>
                                    </Body>
                                </ListItem>
                            );
                        }}
                    />
                </Content>
            </Container>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        isLoggedIn: state.auth.isLoggedIn,
        roles: state.auth.roles,
        username: state.auth.username
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        logout: () => {
            dispatch(logout());
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);