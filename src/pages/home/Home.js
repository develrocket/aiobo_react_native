import React, {Component} from 'react';
import {
    Button,
    Header,
    Left,
    Body,
    Right,
    Title,
    ListItem,
    Text,
    Badge,
    Segment,
    ActionSheet,
    Card,
    CardItem,
    Picker,
    Container,
    Content
} from 'native-base';
import Icon from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';
import {
    ListView,
    View,
    Dimensions,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import s from '../Style';
import {bgHeader, bgContainer} from "../../styles";
import {Col, Row, Grid} from 'react-native-easy-grid';

let {width} = Dimensions.get('window');


const routes = [
    {
        routeName: 'Agent',
        name: "View Agents",
        icon: 'md-people'
    },
    {
        routeName: 'SendApplication',
        name: 'Send Application',
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
    }
];

class Home extends Component {

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

    componentDidMount() {
    }

    openPage(routeName) {
        this.props.navigation.navigate(routeName);
    }

    render() {
        return (
            <Container style={{backgroundColor: bgContainer}}>
                <Header style={s.menuHeader}>
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.navigate("DrawerOpen")}>
                            <Icon name="md-menu" style={s.menuIcon}/>
                        </Button>
                    </Left>
                    <Body>
                    <Title style={{color: '#ffffff', width: 200}}>Home</Title>
                    </Body>
                    <Right/>
                </Header>
                <Image style={{ width: width, height: width * 1263 / 2248, position: 'absolute', bottom:0, left:0 }} source={require('../../imgs/background_1.png')} />
                <Content>
                    <View style={{flex: 1, backgroundColor: bgContainer, padding: 15}}>
                        <View style={{width: '100%', height: '100%'}}>
                            <Grid>
                                <Col>
                                    {
                                        this.state.routes.map((data, i) => {
                                            if (i % 2 == 0) {
                                                return (
                                                    <Row style={{height: 100}} key={i}>
                                                        <TouchableOpacity
                                                            style={{height: 100, width: '100%'}}
                                                            onPress={() => this.openPage(data.routeName)}>
                                                            <Card style={{backgroundColor: bgHeader}}>
                                                                <CardItem style={{width: '100%', backgroundColor: bgHeader, paddingLeft: 0, paddingRight: 0}}>
                                                                    <Body style={{
                                                                        flex: 1,
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                    <Icon name={data.icon} style={{fontSize: 40, color: '#fff'}} />
                                                                    <Text style={{color: '#fff', fontSize: 13}}>{data.name}</Text>
                                                                    </Body>
                                                                </CardItem>
                                                            </Card>
                                                        </TouchableOpacity>
                                                    </Row>
                                                )
                                            }
                                        })
                                    }
                                </Col>
                                <Col>
                                    {
                                        this.state.routes.map((data, i) => {
                                            if (i % 2 == 1) {
                                                return (
                                                    <Row style={{height: 100}} key={i}>
                                                        <TouchableOpacity
                                                            style={{height: 100, width: '100%'}}
                                                            onPress={() => this.openPage(data.routeName)}>
                                                            <Card style={{backgroundColor: bgHeader}}>
                                                                <CardItem style={{width: '100%', backgroundColor: bgHeader, paddingLeft: 0, paddingRight: 0}}>
                                                                    <Body style={{
                                                                        flex: 1,
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                    <Icon name={data.icon} style={{fontSize: 40, color: '#fff'}} />
                                                                    <Text style={{color: '#fff', fontSize: 13}}>{data.name}</Text>
                                                                    </Body>
                                                                </CardItem>
                                                            </Card>
                                                        </TouchableOpacity>
                                                    </Row>
                                                )
                                            }
                                        })
                                    }
                                </Col>
                            </Grid>
                        </View>
                    </View>
                </Content>
            </Container>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        roles: state.auth.roles
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);