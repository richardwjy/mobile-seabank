import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, BackHandler, Modal, ActivityIndicator } from 'react-native';
import { Appbar, Snackbar } from 'react-native-paper'
import { PRIMARY } from '../assets/Colors';

import EntypoIcon from "react-native-vector-icons/Entypo";
import EvilIconsIcon from "react-native-vector-icons/EvilIcons";

import { Picker } from '@react-native-picker/picker';
import Divider from '../components/Divider';
import FooterInputTrx from '../components/FooterInput';

import { DeviceEventEmitter } from 'react-native';
import DataWedgeIntents from 'react-native-datawedge-intents';

import { execSql, getApi } from '../helpers/db';
import moment from 'moment';

import { preventDoubleClick } from '../components/preventDoubleClick';
import { API_FETCH_ASSET_DESC, API_FETCH_LOCATION_DESC } from '../helpers/api';


type Props = {};
export default class App extends Component<Props> {
    constructor(Props) {
        super(Props)
        this.state = {
            ean8checked: true,
            ean13checked: true,
            code39checked: true,
            code128checked: true,
            lastApiVisible: false,
            lastApiText: "Messages from DataWedge will go here",
            checkBoxesDisabled: true,
            scanButtonVisible: false,
            dwVersionText: "Pre 6.3.  Please create and configure profile manually.  See the ReadMe for more details",
            dwVersionTextStyle: styles.itemTextAttention,
            activeProfileText: "Requires DataWedge 6.3+",
            enumeratedScannersText: "Requires DataWedge 6.3+",

            scans: [],

            isLoading: false,
            //Toast Message
            snackVis: false,
            snackMsg: '',

            locationScan: '',
            locationDesc: '',
            assetNumScan: '',
            assetDesc: '',
            condition: '',
            scanDateTime: '',

            isPrevAsset: false,
            prevAssetId: -1
        };
        this.sendCommandResult = "false";
    }
    // const[snackVis, setSnackVis] = useState(false);
    // const[snackMsg, setSnackMsg] = useState('');
    componentDidMount() {
        this.state.deviceEmitterSubscription = DeviceEventEmitter.addListener('datawedge_broadcast_intent', (intent) => { this.broadcastReceiver(intent) });
        BackHandler.addEventListener('hardwareBackPress', () => preventDoubleClick(() => this.saveHandler()))
        this.registerBroadcastReceiver();
        this.determineVersion();
    }
    componentWillUnmount() {
        this.state.deviceEmitterSubscription.remove();
        BackHandler.removeEventListener('hardwareBackPress', () => true)
    }

    _onPressScanButton() {
        this.sendCommand("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER", 'TOGGLE_SCANNING');
        // this.sendCommand("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER", 'SYMBOL_TRIGGER_1');
    }

    determineVersion() {
        this.sendCommand("com.symbol.datawedge.api.GET_VERSION_INFO", "");
    }

    setDecoders() {
        //  Set the new configuration
        var profileConfig = {
            "PROFILE_NAME": "seabankopname",
            "PROFILE_ENABLED": "true",
            "CONFIG_MODE": "UPDATE",
            "PLUGIN_CONFIG": {
                "PLUGIN_NAME": "BARCODE",
                "PARAM_LIST": {
                    //"current-device-id": this.selectedScannerId,
                    "scanner_selection": "auto",
                    "decoder_ean8": "" + this.state.ean8checked,
                    "decoder_ean13": "" + this.state.ean13checked,
                    "decoder_code128": "" + this.state.code128checked,
                    "decoder_code39": "" + this.state.code39checked
                }
            }
        };
        this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);
    }

    sendCommand(extraName, extraValue) {
        console.log("Sending Command: " + extraName + ", " + JSON.stringify(extraValue));
        var broadcastExtras = {};
        broadcastExtras[extraName] = extraValue;
        broadcastExtras["SEND_RESULT"] = this.sendCommandResult;
        DataWedgeIntents.sendBroadcastWithExtras({
            action: "com.symbol.datawedge.api.ACTION",
            extras: broadcastExtras
        });
    }

    registerBroadcastReceiver() {
        DataWedgeIntents.registerBroadcastReceiver({
            filterActions: [
                'com.seabankopname.ACTION',
                'com.symbol.datawedge.api.RESULT_ACTION'
            ],
            filterCategories: [
                'android.intent.category.DEFAULT'
            ]
        });
    }

    broadcastReceiver(intent) {
        //  Broadcast received
        console.log('Received Intent: ' + JSON.stringify(intent));
        if (intent.hasOwnProperty('RESULT_INFO')) {
            var commandResult = intent.RESULT + " (" +
                intent.COMMAND.substring(intent.COMMAND.lastIndexOf('.') + 1, intent.COMMAND.length) + ")";// + JSON.stringify(intent.RESULT_INFO);
            this.commandReceived(commandResult.toLowerCase());
        }

        if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_VERSION_INFO')) {
            //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX  
            var versionInfo = intent['com.symbol.datawedge.api.RESULT_GET_VERSION_INFO'];
            console.log('Version Info: ' + JSON.stringify(versionInfo));
            var datawedgeVersion = versionInfo['DATAWEDGE'];
            console.log("Datawedge version: " + datawedgeVersion);

            //  Fire events sequentially so the application can gracefully degrade the functionality available on earlier DW versions
            if (datawedgeVersion >= "6.3")
                this.datawedge63();
            if (datawedgeVersion >= "6.4")
                this.datawedge64();
            if (datawedgeVersion >= "6.5")
                this.datawedge65();

            this.setState(this.state);
        }
        else if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS')) {
            //  Return from our request to enumerate the available scanners
            var enumeratedScannersObj = intent['com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS'];
            this.enumerateScanners(enumeratedScannersObj);
        }
        else if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE')) {
            //  Return from our request to obtain the active profile
            var activeProfileObj = intent['com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE'];
            this.activeProfile(activeProfileObj);
        }
        else if (!intent.hasOwnProperty('RESULT_INFO')) {
            //  A barcode has been scanned
            this.barcodeScanned(intent, new Date().toLocaleString());
        }
    }

    datawedge63() {
        console.log("Datawedge 6.3 APIs are available");
        //  Create a profile for our application
        this.sendCommand("com.symbol.datawedge.api.CREATE_PROFILE", "seabankopname");

        this.state.dwVersionText = "6.3.  Please configure profile manually.  See ReadMe for more details.";

        //  Although we created the profile we can only configure it with DW 6.4.
        this.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");

        //  Enumerate the available scanners on the device
        this.sendCommand("com.symbol.datawedge.api.ENUMERATE_SCANNERS", "");

        //  Functionality of the scan button is available
        this.state.scanButtonVisible = true;

    }

    datawedge64() {
        console.log("Datawedge 6.4 APIs are available");

        //  Documentation states the ability to set a profile config is only available from DW 6.4.
        //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
        this.state.dwVersionText = "6.4.";
        this.state.dwVersionTextStyle = styles.itemText;
        //document.getElementById('info_datawedgeVersion').classList.remove("attention");

        //  Decoders are now available
        this.state.checkBoxesDisabled = false;

        //  Configure the created profile (associated app and keyboard plugin)
        var profileConfig = {
            "PROFILE_NAME": "seabankopname",
            "PROFILE_ENABLED": "true",
            "CONFIG_MODE": "UPDATE",
            "PLUGIN_CONFIG": {
                "PLUGIN_NAME": "BARCODE",
                "RESET_CONFIG": "true",
                "PARAM_LIST": {}
            },
            "APP_LIST": [{
                "PACKAGE_NAME": "com.seabankopname",
                "ACTIVITY_LIST": ["*"]
            }]
        };
        this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);

        //  Configure the created profile (intent plugin)
        var profileConfig2 = {
            "PROFILE_NAME": "seabankopname",
            "PROFILE_ENABLED": "true",
            "CONFIG_MODE": "UPDATE",
            "PLUGIN_CONFIG": {
                "PLUGIN_NAME": "INTENT",
                "RESET_CONFIG": "true",
                "PARAM_LIST": {
                    "intent_output_enabled": "true",
                    "intent_action": "com.seabankopname.ACTION",
                    "intent_delivery": "2"
                }
            }
        };
        this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig2);

        //  Give some time for the profile to settle then query its value
        setTimeout(() => {
            this.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
        }, 1000);
    }

    datawedge65() {
        console.log("Datawedge 6.5 APIs are available");

        this.state.dwVersionText = "6.5 or higher.";

        //  Instruct the API to send 
        this.sendCommandResult = "true";
        this.state.lastApiVisible = true;
    }

    commandReceived(commandText) {
        this.state.lastApiText = commandText;
        this.setState(this.state);
    }

    enumerateScanners(enumeratedScanners) {
        var humanReadableScannerList = "";
        for (var i = 0; i < enumeratedScanners.length; i++) {
            console.log("Scanner found: name= " + enumeratedScanners[i].SCANNER_NAME + ", id=" + enumeratedScanners[i].SCANNER_INDEX + ", connected=" + enumeratedScanners[i].SCANNER_CONNECTION_STATE);
            humanReadableScannerList += enumeratedScanners[i].SCANNER_NAME;
            if (i < enumeratedScanners.length - 1)
                humanReadableScannerList += ", ";
        }
        this.state.enumeratedScannersText = humanReadableScannerList;
    }

    activeProfile(theActiveProfile) {
        this.state.activeProfileText = theActiveProfile;
        this.setState(this.state);
    }

    async barcodeScanned(scanData, timeOfScan) {
        var scannedData = scanData["com.symbol.datawedge.data_string"];
        var scannedType = scanData["com.symbol.datawedge.label_type"];
        console.log("Scan: " + scannedData);
        // this.state.scans.unshift({ data: scannedData, decoder: scannedType, timeAtDecode: timeOfScan });

        //Start Logic insert data
        //1. The very first scanned data will be inserted to Location QR
        //2. The next scanned data will be inserted to Asset Number

        //Identifier: Location starts with L, Asset Number QR starts with A
        if (scannedData) {
            const identifier = scannedData.split('|')[0];
            if ((identifier != 'A' && identifier != 'L')) {
                console.log(identifier)
                console.log(scannedData.split('|').length)
                // Alert.alert('Wrong QR', 'Please scan the correct QR', [{ text: 'Okay' }])
                this.onToggleSnackBar('QR not recognized!')
                return
            }
            if (!this.state.locationScan) { //If Location is Null
                if (identifier === 'L') {
                    let locArr = scannedData.split('|'); //Splitting L|BC|123 into array
                    locArr.shift(); //Deleting L from the array

                    //Run Location Desc API
                    const dbApi = await getApi(API_FETCH_LOCATION_DESC);
                    const rawApi = dbApi.rows.item(0).api_url;
                    const api = rawApi.replace(':combinationLocID', locArr.join('|'))
                    console.log(api)
                    this.setIsLoading(true)
                    try {
                        const response = await this.fetchWithTimeout(api, { timeout: 1000 })
                        const locDesc = await response.json()
                        console.log(locDesc)
                        console.log(locDesc.hasOwnProperty('location_desc'))
                        if (locDesc.hasOwnProperty('errormessage')) {
                            this.onToggleSnackBar(locDesc.errormessage)
                            this.state.locationDesc = '-'
                        } else if (locDesc.hasOwnProperty('location_desc')) {
                            console.log('Entered')
                            this.state.locationDesc = locDesc.location_desc;
                        }
                    } catch (err) {
                        console.log(err)
                        this.onToggleSnackBar('Network request failed')
                        this.state.locationDesc = '-'
                    }
                    this.setIsLoading(false)
                    this.state.locationScan = locArr.join('|');
                }
                else {
                    // Alert.alert('Wrong Location QR', 'Please scan the correct Location QR', [{ text: 'Okay' }])
                    this.onToggleSnackBar('Location QR not recognized!')
                    return
                }
            } else if (this.state.locationScan) {//Location has been scanned
                if (identifier === 'A') {
                    let assetArr = scannedData.split('|');
                    assetArr.shift();
                    let prevAssetId = await this.getPrevAssetId(assetArr.join('|'));
                    console.log(prevAssetId)
                    if (prevAssetId >= 0) {
                        Alert.alert('Double Scanned', 'Asset has been scan previously, are you sure to continue?', [
                            { text: 'No' },
                            {
                                text: 'Yes',
                                onPress: () => {
                                    if (this.state.assetNumScan) {
                                        Alert.alert('Warning!', 'Previously Scanned data (Asset Number: ' + this.state.assetNumScan + ') will be discard, are you sure to continue?', [{ text: 'No' }, { text: 'Yes', onPress: () => this.setInitialPrevAsset(scannedData, prevAssetId) }])
                                        return
                                    } else {
                                        this.setInitialPrevAsset(scannedData, prevAssetId)
                                    }
                                }
                            }])
                        return
                    }
                    if (this.state.assetNumScan) {
                        Alert.alert('Warning!', 'Previously scanned data (Asset Number : ' + this.state.assetNumScan + ') will be discard, are you sure to continue?', [{ text: 'No' }, { text: 'Yes', onPress: () => this.setInitialAsset(scannedData) }])
                        return;
                    }
                    await this.setInitialAsset(scannedData)
                }
                else {
                    // Alert.alert('Wrong Asset QR', 'Please scan the correct Asset Number QR', [{ text: 'Okay' }])
                    this.onToggleSnackBar('Asset Number QR not recognized!')
                    return
                }
            }
        }
        this.setState(this.state);
    }

    async fetchWithTimeout(resource, options) {
        const { timeout = 8000 } = options;

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);

        return response;
    }

    setIsLoading(val) {
        this.state.isLoading = val
        this.setState(this.state)
    }

    async getPrevAssetId(scannedAssetNum) {
        console.log('Scanned Asset Num:' + scannedAssetNum)
        const dbResult = await execSql('SELECT * FROM trx_opname WHERE asset_number=? ', [scannedAssetNum])
        console.log('Get Prev asset id')
        console.log(dbResult)
        if (dbResult.rows.length > 0) {
            return dbResult.rows.item(0).transaction_line_id;
        } else {
            return -1;
        }
    }

    async setInitialAsset(scanData) {
        let assetArr = scanData.split('|');
        assetArr.shift();
        //Run Asset Number API to get Asset Description
        const dbApi = await getApi(API_FETCH_ASSET_DESC);
        const rawApi = dbApi.rows.item(0).api_url;
        const api = rawApi.replace(':assetNumber', assetArr.join('|'))
        this.setIsLoading(true)
        try {
            const response = await this.fetchWithTimeout(api, {
                headers: {
                    "Content-type": "application/json"
                },
                timeout: 1000
            })
            const assetDesc = await response.json()
            if (assetDesc.hasOwnProperty('errormessage')) {
                this.onToggleSnackBar(assetDesc.errormessage)
                this.state.assetDesc = '-'
            } else if (assetDesc.hasOwnProperty('description')) {
                this.state.assetDesc = assetDesc.description;
            }
        } catch (err) {
            this.onToggleSnackBar('Network request failed')
            this.state.assetDesc = '-'
        }
        this.setIsLoading(false)

        this.state.assetNumScan = assetArr.join('|');
        this.state.condition = 'Good';
        this.state.scanDateTime = moment().format('DD/MM/YYYY HH:mm:ss');

        this.state.prevAssetId = -1;
        this.state.isPrevAsset = false;
    }

    async setInitialPrevAsset(scanData, prevId) {
        await this.setInitialAsset(scanData);
        this.state.isPrevAsset = true;
        this.state.prevAssetId = prevId;
        const dbCondition = await execSql('SELECT condition FROM trx_opname WHERE transaction_line_id=? ', [prevId])
        this.state.condition = dbCondition.rows.item(0).condition;
        this.setState(this.state);
    }

    onToggleSnackBar(text) {
        this.state.snackMsg = text
        this.state.snackVis = true
        this.setState(this.state)
    }

    onDismissSnackBar() {
        //setSnackVis(false)
        this.state.snackMsg = ''
        this.state.snackVis = false
        this.setState(this.state)
    }

    _goBack() {
        if (this.state.assetNumScan || this.state.locationScan) {
            Alert.alert('Warning!', 'Scanned data will be discard, are you sure to continue?', [{ text: 'No' }, { text: 'Yes', onPress: () => this.props.navigation.navigate('Home') }])
            return
        }
        this.props.navigation.navigate('Home')
    }

    resetAssetData() {
        this.state.assetNumScan = ''
        this.state.assetDesc = ''
        this.state.scanDateTime = ''
        this.state.condition = ''
        this.state.prevAssetId = -1
        this.state.isPrevAsset = false
        this.setState(this.state)
    }

    async saveHandler() {
        this.setIsLoading(true)
        if (!this.state.locationScan || !this.state.assetNumScan || !this.state.condition) {
            this.setIsLoading(false)
            this.onToggleSnackBar('All field must be filled!')
            return
        }
        console.log('Prev Asset')
        console.log(this.state.isPrevAsset)

        if (!this.state.isPrevAsset) {
            console.log('Masuk')
            const dbResult = await execSql(
                'INSERT INTO trx_opname(condition,location_qr,location_desc,asset_number,asset_desc,scan_qr_date) VALUES(?,?,?,?,?,?)',
                [this.state.condition + '', this.state.locationScan + '', this.state.locationDesc + '', this.state.assetNumScan + '', this.state.assetDesc + '', this.state.scanDateTime + '']
            )
            const selectAll = await execSql('SELECT * FROM trx_opname;', [])
            console.log(selectAll.rows.raw())
            this.onToggleSnackBar('Data successfully saved!')
        }
        else {
            try {
                const dbResult = await execSql(
                    'UPDATE trx_opname SET location_qr=?, location_desc=?, condition=?, scan_qr_date = ? WHERE transaction_line_id=?',
                    [this.state.locationScan, this.state.locationDesc, this.state.condition, this.state.scanDateTime, this.state.prevAssetId]
                )
                this.onToggleSnackBar('Data successfully updated!')
            } catch (err) {
                console.log(err)
                this.onToggleSnackBar('Update data failed!')
            }
        }
        this.resetAssetData();
        this.setIsLoading(false)
    }

    changeLocation() {
        console.log('Change location')
        this.state.locationScan = ''
        this.state.locationDesc = ''
        this.resetAssetData()
        this.onToggleSnackBar('Location changed !')
    }

    deleteTransaction() {
        this.resetAssetData()
        this.onToggleSnackBar('Transaction deleted !')
    }

    footerLocationHandler() {
        if (this.state.locationScan) {
            Alert.alert('Warning!', 'Scanned location will be discard if not saved, are you sure to continue?', [{ text: 'No' }, { text: 'Yes', onPress: () => this.changeLocation() }])
            return;
        } else if (!this.state.locationScan) {
            this.onToggleSnackBar('Location not set !')
            return
        }
        this.changeLocation();
    }

    footerDeleteHandler() {
        if (this.state.assetNumScan) {
            Alert.alert('Warning!', 'Scanned asset will be delete, are you sure to continue?', [{ text: 'No' }, { text: 'Yes', onPress: () => this.deleteTransaction() }])
            return
        } else {
            this.onToggleSnackBar('There is no asset to delete !')
        }
    }

    render() {
        return (
            <View style={{ height: '100%' }}>
                <Appbar.Header style={{ backgroundColor: 'white' }}>
                    <Appbar.BackAction onPress={() => preventDoubleClick(() => this._goBack())} color={PRIMARY} />
                    <Appbar.Content title="Input Opname" color={PRIMARY} />
                    <Appbar.Action icon="upload" color={PRIMARY} onPress={() => preventDoubleClick(() => this.saveHandler())} />
                </Appbar.Header>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.isLoading}
                >
                    <View style={styles.loading}>
                        <ActivityIndicator
                            color={PRIMARY}
                            size="large"
                            style={styles.activity}
                        >
                        </ActivityIndicator>
                    </View>
                </Modal>
                <View style={styles.body}>
                    <ScrollView style={styles.scrollBody} horizontal={false}>
                        <View style={{ alignItems: 'center' }}>
                            {/* Location */}
                            <Text style={styles.subheader}>Location Information</Text>

                            <View style={styles.group}>
                                <View style={styles.groupBackground}>
                                    <View style={styles.groupItem}>
                                        <View style={styles.iconWrapper}>
                                            <EntypoIcon
                                                name="location-pin"
                                                style={styles.icon}
                                            ></EntypoIcon>
                                        </View>
                                        <View style={styles.textGroup}>
                                            <View style={styles.textWrapper}>
                                                <Text style={styles.text}>Location QR</Text>
                                            </View>
                                            <View style={styles.textInputWrapper}>
                                                <TextInput
                                                    placeholder="Location"
                                                    style={styles.textInput}
                                                    value={this.state.locationScan}
                                                    editable={false}
                                                ></TextInput>
                                            </View>
                                        </View>
                                        <View style={styles.buttonWrapper}>
                                            <TouchableOpacity
                                                style={styles.buttonAction}
                                                onPress={() => this._onPressScanButton()}
                                                disabled={this.state.locationScan ? true : false}
                                            >
                                                <EvilIconsIcon
                                                    name="chevron-right"
                                                    style={styles.buttonIcon}
                                                ></EvilIconsIcon>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.groupDesc}>
                                <View style={styles.groupBackground}>
                                    <View style={styles.groupItem}>
                                        <View style={styles.iconWrapper}>
                                            <EntypoIcon
                                                name="location-pin"
                                                style={styles.icon}
                                            ></EntypoIcon>
                                        </View>
                                        <View style={styles.textGroup}>
                                            <View style={styles.textWrapper}>
                                                <Text style={styles.text}>Location Description</Text>
                                            </View>
                                            <View style={styles.textInputWrapper}>
                                                <TextInput
                                                    placeholder="Location Description"
                                                    value={this.state.locationDesc}
                                                    style={styles.textInput}
                                                    multiline
                                                    numberOfLines={3}
                                                    editable={false}
                                                ></TextInput>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <Divider />
                            <Text style={styles.subheader}>Asset Information</Text>
                            {/* Asset Number */}
                            <View style={styles.group}>
                                <View style={styles.groupBackground}>
                                    <View style={styles.groupItem}>
                                        <View style={styles.iconWrapper}>
                                            <EntypoIcon
                                                name="bookmark"
                                                style={styles.icon}
                                            ></EntypoIcon>
                                        </View>
                                        <View style={styles.textGroup}>
                                            <View style={styles.textWrapper}>
                                                <Text style={styles.text}>Asset Number</Text>
                                            </View>
                                            <View style={styles.textInputWrapper}>
                                                <TextInput
                                                    placeholder="Asset Number"
                                                    style={styles.textInput}
                                                    value={this.state.assetNumScan}
                                                    editable={false}
                                                ></TextInput>
                                            </View>
                                        </View>
                                        <View style={styles.buttonWrapper}>
                                            <TouchableOpacity
                                                style={styles.buttonAction}
                                                onPress={() => this.footerDeleteHandler()}
                                                disabled={this.state.locationScan ? false : true}
                                            >
                                                <EvilIconsIcon
                                                    name="trash"
                                                    style={styles.buttonIcon}
                                                ></EvilIconsIcon>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            {/* Asset Description */}
                            <View style={styles.groupDesc}>
                                <View style={styles.groupBackground}>
                                    <View style={styles.groupItem}>
                                        <View style={styles.iconWrapper}>
                                            <EntypoIcon
                                                name="list"
                                                style={styles.icon}
                                            ></EntypoIcon>
                                        </View>
                                        <View style={styles.textGroup}>
                                            <View style={styles.textWrapper}>
                                                <Text style={styles.text}>Description</Text>
                                            </View>
                                            <View style={styles.textInputWrapper}>
                                                <TextInput
                                                    placeholder="Description"
                                                    style={styles.textInput}
                                                    value={this.state.assetDesc}
                                                    multiline
                                                    numberOfLines={3}
                                                    editable={false}
                                                ></TextInput>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            {/* Condition */}
                            <View style={styles.group}>
                                <View style={styles.groupBackground}>
                                    <View style={styles.groupItem}>
                                        <View style={styles.iconWrapper}>
                                            <EntypoIcon
                                                name="eye"
                                                style={styles.icon}
                                            ></EntypoIcon>
                                        </View>
                                        <View style={styles.textGroup}>
                                            <View style={styles.textWrapper}>
                                                <Text style={styles.text}>Condition</Text>
                                            </View>
                                            <View style={{ marginTop: -10 }}>
                                                <Picker
                                                    onValueChange={(itemValue, itemIndex) => {
                                                        this.state.condition = itemValue;
                                                        this.setState(this.state);
                                                    }}
                                                    selectedValue={this.state.condition}
                                                    mode="dialog"
                                                    enabled={this.state.locationScan ? true : false}
                                                >
                                                    <Picker.Item label="Good / Not Good" value="" enabled={false} />
                                                    <Picker.Item label="Good" value="Good" />
                                                    <Picker.Item label="Not Good" value="Not Good" />
                                                </Picker>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            {/* Scan Date Time */}
                            <View style={styles.group}>
                                <View style={styles.groupBackground}>
                                    <View style={styles.groupItem}>
                                        <View style={styles.iconWrapper}>
                                            <EntypoIcon
                                                name="calendar"
                                                style={styles.icon}
                                            ></EntypoIcon>
                                        </View>
                                        <View style={styles.textGroup}>
                                            <View style={styles.textWrapper}>
                                                <Text style={styles.text}>Scan Date Time</Text>
                                            </View>
                                            <View style={styles.textInputWrapper}>
                                                <TextInput
                                                    placeholder="Description"
                                                    style={styles.textInput}
                                                    editable={false}
                                                    value={this.state.scanDateTime}
                                                ></TextInput>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    <View style={{ width: '100%', position: 'absolute', bottom: 0 }}>
                        <Snackbar
                            visible={this.state.snackVis}
                            onDismiss={() => this.onDismissSnackBar()}
                            duration={3000}
                        >
                            {this.state.snackMsg}
                        </Snackbar>
                    </View>
                    <FooterInputTrx style={styles.footer}
                        onClickFooterLocation={() => preventDoubleClick(() => this.footerLocationHandler())}
                        onClickFooterScan={() => preventDoubleClick(() => this._onPressScanButton(), 300)}
                        onClickFooterDelete={() => preventDoubleClick(() => this.footerDeleteHandler())}
                    />
                </View>
            </View >
        )
    }
}

const styles = StyleSheet.create({
    body: {
        height: '88%',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    activity: {
        width: 22,
        height: 22
    },
    scrollBody: {
        width: '100%',
        marginBottom: 50
    },
    subheader: {
        color: "rgba(60,60,67,0.6)",
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'left',
        width: '85%',
    },
    footer: {
        width: '100%',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        position: 'absolute',
        bottom: 0
    },
    group: {
        width: 300,
        height: 50,
        borderRadius: 10,
        marginBottom: 10,
        marginTop: 5
    },
    groupDesc: {
        width: 300,
        height: 75,
        borderRadius: 10,
        marginBottom: 10,
        marginTop: 5
    },
    groupBackground: {
        backgroundColor: "rgba(255,255,255,1)",
        borderRadius: 10,
        flex: 1
    },
    groupItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        flex: 1
    },
    iconWrapper: {
        width: 30,
        height: 50,
        alignItems: "center",
        justifyContent: "center"
    },
    icon: {
        color: "rgba(128,128,128,1)",
        fontSize: 25
    },
    textGroup: {
        width: 250,
        marginTop: '4%'
    },
    textWrapper: {
        width: 250,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.78)",
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderStyle: "dotted",
    },
    text: {
        fontFamily: "SFProText-Regular",
        color: "#121212",
        fontSize: 14
    },
    textInputWrapper: {
        width: 250,
        marginTop: -8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    textInput: {
        fontFamily: "SFProText-Regular",
        color: "#121212",
        fontSize: 12,
        width: 233,
    },
    buttonWrapper: {
        width: 23,
        height: 50,
        justifyContent: "center",
        alignItems: "center"
    },
    buttonAction: {
        width: 23,
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    buttonIcon: {
        color: "rgba(128,128,128,1)",
        fontSize: 22
    },
})
