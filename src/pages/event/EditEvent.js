import React, {Component} from 'react';
import {
    Button,
    Container,
    Content,
    Header,
    Left,
    Body,
    Right,
    Title,
    Form,
    Item,
    Label,
    Input,
    Text,
    View,
    ListItem,
    CheckBox
} from 'native-base';
import {Image, Dimensions, Alert, TouchableOpacity, Keyboard, Platform, StyleSheet, Picker} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import s from '../Style';
import Config from 'react-native-config';
import {connect} from 'react-redux';
import {getRequest, postRequest, formRequest} from "../../actions/Service";
import Loader from '../../components/Loader';
import {bgHeader, bgContainer} from "../../styles";
import {TextInputMask} from 'react-native-masked-text';
import DatePicker from 'react-native-datepicker';
import {DocumentPicker, DocumentPickerUtil} from 'react-native-document-picker';
import {Col, Row, Grid} from 'react-native-easy-grid';
import ImagePicker from 'react-native-image-picker';

let {width} = Dimensions.get('window');

class EditEvent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isSubmitted: false,
            locationList: [],
            setupTypes: [],
            docTypes: [],
            location_id: '',
            location_name: '',
            start_date: this.getCurrentDate(),
            start_time: '',
            end_date: this.getCurrentDate(),
            end_type: '',
            setup_type_id: '',
            documentList: [],
            showWeekDays: false,
            weekDays: [
                {
                    name: 'Mon',
                    checked: false
                },
                {
                    name: 'Tue',
                    checked: false
                },
                {
                    name: 'Wed',
                    checked: false
                },
                {
                    name: 'Thu',
                    checked: false
                },
                {
                    name: 'Fri',
                    checked: false
                },
                {
                    name: 'Sat',
                    checked: false
                },
                {
                    name: 'Sun',
                    checked: false
                }
            ],
            event_id: ''
        };
    }

    componentDidMount() {
        console.log(this.props);
        if (!this.props.locationList || this.props.locationList.length === 0) {
            this.props.getLocationList();
        } else {
            this.setState({locationList: this.props.locationList});
        }

        if (!this.props.setupTypes || this.props.setupTypes.length === 0) {
            this.props.getSetupTypes();
        } else {
            this.setState({setupTypes: this.props.setupTypes});
        }

        let event = this.props.navigation.getParam('event', {});

        if (Object.keys(event).length > 0) {
            this.setState({
                event_id: event.id,
                location_id: event.location_id,
                start_date: event.start_date,
                end_date: event.end_date,
                start_time: event.start_time,
                end_time: event.end_time,
                setup_type_id: event.setup_type_id
            });
            let weekDayNumbers = event.week_days.split(",");
            let weekDays = this.state.weekDays;
            for (let i = 0; i < weekDayNumbers.length; i ++) {
                weekDays[weekDayNumbers[i] - 1].checked = true;
            }
            this.setState({weekDays: weekDays});
            let documents = [];
            for (let i = 0; i < event.docs.length; i ++) {
                let doc = event.docs[i];
                let fileExt = doc.filename.substring(doc.filename.lastIndexOf('.') + 1);
                let fileType = 'image';
                if (fileExt.toLowerCase() === 'pdf') {
                    fileType = 'pdf';
                }
                documents.push ({
                    doc_type_id: doc.doc_type_id,
                    doc_type_name: doc.doc_type_name,
                    content: {
                        name: '',
                        type: '',
                        uri: ''
                    },
                    fileName: doc.filename,
                    filePath: doc.path,
                    fileType: fileType
                })
            }
            // this.setState({documentList: documents})
        }


        setTimeout(() => {
            if (!this.props.docTypes || this.props.docTypes.length === 0) {
                this.props.getDocTypes();
            } else {
                this.setState({docTypes: this.props.docTypes});
                // this.setDocumentList();
            }
        }, 100);


        this.calculateWeekDays();
    }

    componentWillReceiveProps(nextProps) {
        console.log('the state', nextProps);
        if (nextProps.data !== null) {
            if (nextProps.requestType === 'location_list') {
                this.setState({locationList: this.props.locationList});
            } else if (nextProps.requestType === 'setup_types_list') {
                this.setState({setupTypes: this.props.setupTypes});
            } else if (nextProps.requestType === 'doc_types_list') {
                this.setState({docTypes: this.props.docTypes});
                // this.setDocumentList();
            } else if (nextProps.requestType === 'create_event') {
                if (nextProps.data.result === 'success') {
                    this.setState({isSubmitted: true})
                }else {
                    setTimeout(() => {
                        Alert.alert(
                            'Error',
                            nextProps.data.msg + '',
                            [
                                {
                                    text: 'OK', onPress: () => {
                                    this.props.createEvent(this.getEventData(0));
                                }
                                },
                                {
                                    text: 'Cancel', onPress: () => {}
                                }
                            ],
                            {cancelable: true}
                        )
                    }, 100);
                }
            }
        }

        if (nextProps.error !== undefined && nextProps.requestType === 'create_event') {
            setTimeout(() => {
                Alert.alert(
                    'Error',
                    nextProps.error.response.data + '',
                    [
                        {
                            text: 'OK', onPress: () => {
                            }
                        }
                    ],
                    {cancelable: true}
                )
            }, 100);
        }
    }

    setDocumentList() {
        let docTypes = this.props.docTypes;
        let documents = this.state.documentList;
        console.log(documents);
        let exist = false;
        for (let i = 0; i < docTypes.length; i ++) {
            for (let j = 0; j < documents.length; j ++) {
                if (documents[j].doc_type_id === docTypes[i].id) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                documents.push({
                    doc_type_id: docTypes[i].id,
                    doc_type_name: docTypes[i].name,
                    content: {
                        uri: '',
                        name: '',
                        type: ''
                    }
                })
            }
            exist = false;
        }

        this.setState({documentList: documents});
    }

    checkValidation() {
        let errMsgs = {
            location_id: 'Please select location',
            start_time: 'Start time is required',
            end_time: 'End time is required',
            setup_type_id: 'Please select setup type'
        };

        let keys = Object.keys(this.state);
        for (let i = 0; i < keys.length; i ++ ) {
            if (errMsgs[keys[i]]) {
                if (this.state[keys[i]] === '') {
                    Alert.alert(
                        'Validation Error',
                        errMsgs[keys[i]],
                        [
                            {
                                text: 'OK', onPress: () => {}
                            }
                        ],
                        {cancelable: true}
                    );
                    return false;
                }
            }
        }

        let weekDays = [];
        for (let i = 0; i < this.state.weekDays.length; i ++) {
            if (this.state.weekDays[i].checked) {
                weekDays.push(i + 1);
            }
        }
        if (this.state.showWeekDays && weekDays.length === 0) {
            Alert.alert(
                'Validation Error',
                'Please select at least one weekdays',
                [
                    {
                        text: 'OK', onPress: () => {}
                    }
                ],
                {cancelable: true}
            );
            return false;
        }

        return true;
    }

    getEventData(isOverLap) {
        const data = new FormData();
        data.append('id', this.state.event_id);
        data.append('location_id', this.state.location_id);
        data.append('start_date', this.state.start_date);
        data.append('end_date', this.state.end_date);
        data.append('start_time', this.state.start_time);
        data.append('end_time', this.state.end_time);
        data.append('setup_type_id', this.state.setup_type_id);
        let weekDays = [];
        for (let i = 0; i < this.state.weekDays.length; i ++) {
            if (this.state.weekDays[i].checked) {
                weekDays.push(i + 1);
            }
        }
        data.append('week_days', weekDays.join(','));
        let doc_type_ids = [];
        let documents = this.state.documentList;
        for (let i = 0; i < documents.length; i ++) {
            if (documents[i].content.name) {
                doc_type_ids.push(documents[i].doc_type_id);
                data.append('files[]', {
                    uri: documents[i].content.uri,
                    type: documents[i].content.type,
                    name: documents[i].content.name
                })
            }
        }
        for (let i = 0; i < doc_type_ids.length; i ++) {
            data.append('doc_type_ids[]', doc_type_ids[i]);
        }
        data.append('check_overlapped', isOverLap);
        return data;
    }

    createOrder() {
        let validation = this.checkValidation();
        console.log(this.getEventData(1));
        if (validation) {
            Alert.alert(
                '',
                'Are you sure update this event?',
                [
                    {
                        text: 'OK', onPress: () => {this.props.createEvent(this.getEventData(1));}
                    },
                    {
                        text: 'Cancel', onPress: () => {}
                    }
                ],
                {cancelable: true}
            );
        }
    }

    resetData() {
        this.setState({
            isSubmitted: false,
        });
    }

    addLocation() {
        this.props.navigation.navigate('AddLocation');
    }

    openPdf(filePath) {
        let fileExt = filePath.substring(filePath.lastIndexOf(".") + 1);
        if (fileExt.toLowerCase() === 'pdf') {
            this.props.navigation.navigate("PdfReader", {file_path: filePath});
        }
    }

    addDocument(index) {
        DocumentPicker.show({
            filetype: [DocumentPickerUtil.allFiles()],
        }, (error, res) => {
            console.log(
                res.uri,
                res.type, // mime type
                res.fileName,
                res.fileSize
            );

            let documentList = this.state.documentList;
            documentList[index].content.name = res.fileName;
            documentList[index].content.type = res.type;
            documentList[index].content.uri = res.uri;
            if (documentList[documentList.length - 1].content.name !== '') {
                documentList.push({
                    doc_type_id: '',
                    content: {
                        uri: '',
                        type: '',
                        name: ''
                    }
                });
            }
            this.setState({documentList: documentList});
        });
    }

    getCurrentDate() {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        if (month < 10) month = '0' + month;
        let day = date.getDate();
        if (day < 10) day = '0' + day;

        return [year, month, day].join('-');
    }

    getPictureFromCamera(index) {
        const options = {
            title: 'Select Image',
            customButtons: [],
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            maxWidth: 1000,
            maxheight: 1000
        };

        ImagePicker.launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                console.log(response);

                let documentList = this.state.documentList;
                documentList[index].content.name = response.uri.substring(response.uri.lastIndexOf('/') + 1);
                documentList[index].content.type = 'image/jpg';
                documentList[index].content.uri = response.uri;
                if (documentList[documentList.length - 1].content.name !== '') {
                    documentList.push({
                        doc_type_id: '',
                        content: {
                            uri: '',
                            type: '',
                            name: ''
                        }
                    });
                }
                this.setState({documentList: documentList});
            }
        });
    }

    setDocType(value, index) {
        let documentList = this.state.documentList;
        documentList[index].doc_type_id = value;
        this.setState({documentList: documentList});
    }

    getDateFromString(dString) {
        let numbers = dString.split('-');
        return new Date(numbers[0], numbers[1] - 1, numbers[2]);
    }

    getDayOfDate(date) {
        let day = date.getDay();
        if (day === 0) day = 7;
        return day;
    }

    setWeekDays(index) {
        let weekDays = this.state.weekDays;
        weekDays[index].checked = !weekDays[index].checked;
        this.setState({weekDays: weekDays});
    }

    calculateWeekDays() {
        if (this.state.start_date && this.state.end_date) {
            let startDate = this.getDateFromString(this.state.start_date);
            let endDate = this.getDateFromString(this.state.end_date);
            console.log(startDate);
            console.log(this.getDayOfDate(startDate));
            let datediff = parseInt((endDate.getTime() - startDate.getTime()) / (24 * 3600 * 1000));
            if (datediff <= 2) {
                let weekDays = this.state.weekDays;
                weekDays[this.getDayOfDate(startDate) - 1].checked = true;
                weekDays[this.getDayOfDate(endDate) - 1].checked = true;
                this.setState({weekDays: weekDays});
            }
            if (datediff > 1) {
                this.setState({showWeekDays: true});
            }
        }
    }

    render() {

        return (
            <Container style={{backgroundColor: bgContainer}}>
                <Image style={{width: width, height: width * 1263 / 2248, position: 'absolute', bottom: 0, left: 0}}
                       source={require('../../imgs/background_1.png')}/>
                <Content padder style={{paddingLeft: 20, paddingRight: 20, paddingTop: 20, paddingBottom: 20}}>
                    <Loader loading={this.props.isLoading}/>
                    {(() => {
                        if (!this.state.isSubmitted) {
                            return (
                                <View>
                                    <Form>
                                        <Item style={{marginLeft: 0, marginTop: 20}} stackedLabel>
                                            <Label>
                                                Location *
                                            </Label>
                                            <Button bordered small style={{position: 'absolute', right: 0}}
                                                    onPress={() => this.addLocation()}>
                                                <Text>Add Location</Text>
                                            </Button>
                                            <Picker
                                                note
                                                mode="dropdown"
                                                style={{width: '100%'}}
                                                selectedValue={this.state.location_id}
                                                onValueChange={(value) => this.setState({location_id: value})}>
                                                <Picker.Item label={'Please select'}/>
                                                {
                                                    this.state.locationList.map((data, i) => {
                                                        return (
                                                            <Picker.Item key={i} label={data.name} value={data.id}/>
                                                        );
                                                    })
                                                }
                                            </Picker>
                                        </Item>
                                        <Item style={{marginLeft: 0, marginTop: 20}} stackedLabel>
                                            <Label>Start Date *</Label>
                                            <DatePicker
                                                style={{width: '100%'}}
                                                date={this.state.start_date}
                                                mode="date"
                                                format="YYYY-MM-DD"
                                                confirmBtnText="Confirm"
                                                cancelBtnText="Cancel"
                                                showIcon={false}
                                                minDate={new Date()}
                                                customStyles={{
                                                    dateInput: {
                                                        marginLeft: 10,
                                                        borderWidth: 0
                                                    },
                                                    dateText: {
                                                        fontSize: 17
                                                    },
                                                    dateTouchBody: {
                                                        height: 50
                                                    }
                                                }}
                                                onDateChange={(date) => {
                                                    this.setState({start_date: date});
                                                    this.calculateWeekDays();
                                                }}
                                            />
                                        </Item>
                                        <Item style={{marginLeft: 0, marginTop: 20}} stackedLabel>
                                            <Label>End Date *</Label>
                                            <DatePicker
                                                style={{width: '100%'}}
                                                date={this.state.end_date}
                                                mode="date"
                                                format="YYYY-MM-DD"
                                                confirmBtnText="Confirm"
                                                cancelBtnText="Cancel"
                                                showIcon={false}
                                                minDate={this.state.start_date}
                                                customStyles={{
                                                    dateInput: {
                                                        marginLeft: 10,
                                                        borderWidth: 0
                                                    },
                                                    dateText: {
                                                        fontSize: 17
                                                    },
                                                    dateTouchBody: {
                                                        height: 50
                                                    }
                                                }}
                                                onDateChange={(date) => {
                                                    this.setState({end_date: date});
                                                    this.calculateWeekDays();
                                                }}
                                            />
                                        </Item>
                                        <Item style={{marginLeft: 0, marginTop: 20}} stackedLabel>
                                            <Label>Start Time *</Label>
                                            <DatePicker
                                                style={{width: '100%'}}
                                                date={this.state.start_time}
                                                mode="time"
                                                format="HH:mm a"
                                                confirmBtnText="Confirm"
                                                cancelBtnText="Cancel"
                                                showIcon={false}
                                                minDate={new Date()}
                                                customStyles={{
                                                    dateInput: {
                                                        marginLeft: 10,
                                                        borderWidth: 0
                                                    },
                                                    dateText: {
                                                        fontSize: 17
                                                    },
                                                    dateTouchBody: {
                                                        height: 50
                                                    }
                                                }}
                                                onDateChange={(date) => {
                                                    this.setState({start_time: date});
                                                }}
                                            />
                                            <Text style={{fontSize: 10, color: '#5c5c5c'}}>Time should be CST timezone.</Text>
                                        </Item>
                                        <Item style={{marginLeft: 0, marginTop: 20}} stackedLabel>
                                            <Label>End Time *</Label>
                                            <DatePicker
                                                style={{width: '100%'}}
                                                date={this.state.end_time}
                                                mode="time"
                                                format="HH:mm a"
                                                confirmBtnText="Confirm"
                                                cancelBtnText="Cancel"
                                                showIcon={false}
                                                customStyles={{
                                                    dateInput: {
                                                        marginLeft: 10,
                                                        borderWidth: 0
                                                    },
                                                    dateText: {
                                                        fontSize: 17
                                                    },
                                                    dateTouchBody: {
                                                        height: 50
                                                    }
                                                }}
                                                onDateChange={(date) => {
                                                    this.setState({end_time: date});
                                                }}
                                            />
                                            <Text style={{fontSize: 10, color: '#5c5c5c'}}>Time should be CST timezone.</Text>
                                        </Item>
                                        <Item style={{marginLeft: 0, marginTop: 20}} stackedLabel>
                                            <Label>
                                                Setup Type
                                            </Label>
                                            <Picker
                                                note
                                                mode="dropdown"
                                                style={{width: '100%'}}
                                                selectedValue={this.state.setup_type_id}
                                                onValueChange={(value) => this.setState({setup_type_id: value})}>
                                                <Picker.Item label={'Please select'}/>
                                                {
                                                    this.state.setupTypes.map((data, i) => {
                                                        return (
                                                            <Picker.Item key={i} label={data.name} value={data.id}/>
                                                        );
                                                    })
                                                }
                                            </Picker>
                                        </Item>
                                        <Item style={{marginLeft: 0, marginTop: 20}} stackedLabel>
                                            <Label style={{marginBottom: 20}}>Week Days *</Label>
                                            {
                                                this.state.weekDays.map((data, i) => (
                                                    <ListItem key={i} style={{width: width - 100}}>
                                                        <CheckBox checked={data.checked} onPress={() => this.setWeekDays(i)}/>
                                                        <Body>
                                                        <Text>{data.name}</Text>
                                                        </Body>
                                                    </ListItem>
                                                ))
                                            }
                                        </Item>
                                        {
                                            this.state.documentList.map((data, i) => (
                                                <Item style={{marginLeft: 0, marginTop: 20}} stackedLabel key={i}>
                                                    <Label style={{marginBottom: 20}}>
                                                        Document: {data.doc_type_name}
                                                    </Label>
                                                    {(() => {
                                                        if (data.content.type === 'image/jpg' || data.content.type === 'image/jpeg' || data.content.type === 'image/png') {
                                                            return (
                                                                <Image style={{width: width - 100, height: 300, marginBottom: 10}} source={{uri: data.content.uri.replace('file://', ''), isStatic: true}} />
                                                            )
                                                        } else if (data.content.type !== '') {
                                                            return (
                                                                <Button transparent onPress={() => this.openPdf(data.content.uri)}>
                                                                    <Icon name="md-document" style={{fontSize: 20}} />
                                                                    <Text style={{fontSize: 13}}>{' ' + data.content.name}</Text>
                                                                </Button>
                                                            )
                                                        }else {
                                                            if (data.fileName) {
                                                                if (data.fileType === 'image') {
                                                                    return (
                                                                        <Image style={{width: width - 100, height: 300, marginBottom: 10}} source={{uri: data.filePath, isStatic: true}} />
                                                                    )
                                                                }else {
                                                                    return (
                                                                        <Button transparent onPress={() => this.openPdf(data.filePath)}>
                                                                            <Icon name="md-document" style={{fontSize: 20}} />
                                                                            <Text style={{fontSize: 13}}>{' ' + data.fileName}</Text>
                                                                        </Button>
                                                                    )
                                                                }
                                                            }
                                                        }
                                                    })()}
                                                    <Grid style={{padding: 5}}>
                                                        <Col style={{padding: 5}}>
                                                            <Button bordered block small onPress={() => this.addDocument(i)}>
                                                                <Text>{data.fileName || data.content.type ? 'Change Document' : 'Add Document'}</Text>
                                                            </Button>
                                                        </Col>
                                                        <Col style={{padding: 5}}>
                                                            <Button bordered block small onPress={() => this.getPictureFromCamera(i)}>
                                                                <Icon name="md-camera" style={{fontSize: 20, color: '#007aff'}}/>
                                                            </Button>
                                                        </Col>
                                                    </Grid>

                                                </Item>
                                            ))
                                        }

                                    </Form>

                                    <Button block style={{backgroundColor: bgHeader, marginTop: 20, marginBottom: 50}}
                                            success onPress={() => this.createOrder()}>
                                        <Text>Submit</Text>
                                    </Button>
                                </View>
                            )
                        } else {
                            return (
                                <View>
                                    <View>
                                        <Image style={{
                                            width: 120,
                                            height: 120,
                                            marginLeft: (width - 160) / 2,
                                            marginTop: 50
                                        }}
                                               source={require('../../imgs/check_icon.png')}/>
                                    </View>
                                    <Text style={{
                                        fontSize: 23,
                                        textAlign: 'center',
                                        color: '#444444',
                                        marginTop: 30,
                                        width: width - 30
                                    }}>Event updated successfully!</Text>
                                </View>
                            )
                        }
                    })()}
                </Content>
            </Container>
        )
    }
}

EditEvent.navigationOptions = ({navigation}) => ({
    header: (
        <Header style={s.menuHeader}>
            <Left>
                <Button transparent onPress={() => navigation.goBack()}>
                    <Icon name="md-arrow-back" style={s.menuIcon}/>
                </Button>
            </Left>
            <Body>
            <Title style={{width: 200, color: '#fff'}}>Edit Event</Title>
            </Body>
            <Right>
                <Button transparent onPress={() => navigation.navigate("Home")}>
                    <Icon name="md-home" style={s.menuIcon}/>
                </Button>
            </Right>
        </Header>
    )
});

const styles = StyleSheet.create({
    inputMask: {
        width: '100%',
        paddingLeft: 10,
        textAlign: 'center',
        ...Platform.select({
            ios: {
                height: 50
            },
            android: {
                paddingTop: 10,
            }
        }),
    },
});

const mapStateToProps = (state, ownProps) => {
    return {
        isLoading: state.service.isLoading,
        error: state.service.error,
        data: state.service.data,
        requestType: state.service.requestType,
        locationList: state.service.locationList,
        setupTypes: state.service.setupTypes,
        docTypes: state.service.docTypes
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getLocationList: () => {
            dispatch(getRequest(Config.LOCATION_LIST_URL, 'location_list'));
        },
        getSetupTypes: () => {
            dispatch(getRequest(Config.SETUP_TYPES_LIST_URL, 'setup_types_list'));
        },
        getDocTypes: () => {
            dispatch(getRequest(Config.DOC_TYPES_LIST_URL, 'doc_types_list'));
        },
        createEvent: (data) => {
            dispatch(formRequest(Config.EVENT_LIST_URL + '/update', data, 'create_event'));
        }
    }
};


export default connect(mapStateToProps, mapDispatchToProps)(EditEvent);