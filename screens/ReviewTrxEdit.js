import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { Appbar } from 'react-native-paper';
import { PRIMARY } from '../assets/Colors';
import { Picker } from '@react-native-picker/picker';
import Divider from '../components/Divider';
import EntypoIcon from "react-native-vector-icons/Entypo";
import EvilIconsIcon from "react-native-vector-icons/EvilIcons";

import { execSql } from '../helpers/db';

import { preventDoubleClick } from '../components/preventDoubleClick';

import { Snackbar } from 'react-native-paper';
import moment from 'moment';

const ReviewTrxEdit = (props) => {
    const [isLoading, setIsLoading] = useState(false);

    const [trxLineId, setTrxLineId] = useState();
    const [locParam, setLocParam] = useState();

    const [location, setLocation] = useState();
    const [locationDesc, setLocationDesc] = useState();
    const [assetNumber, setAssetNumber] = useState();
    const [assetDesc, setAssetDesc] = useState();
    const [condition, setCondition] = useState();
    const [scanQrDate, setScanQrDate] = useState();

    const [snackVis, setSnackVis] = useState(false);
    const [snackMsg, setSnackMsg] = useState('');

    useEffect(() => {
        const fetchAsset = async () => {
            setIsLoading(true)
            const assetNumParam = props.navigation.getParam('assetNumParam');
            const locationParam = props.navigation.getParam('locationParam');
            try {
                const dbResult = await execSql('SELECT * FROM trx_opname WHERE asset_number = ? AND location_qr =?', [assetNumParam, locationParam])
                console.log(dbResult.rows.raw())
                if (dbResult.rows.length > 0) {
                    //Set Data asset
                    const data = dbResult.rows.item(0);
                    setLocParam(locationParam);

                    setTrxLineId(data.transaction_line_id);
                    setLocation(data.location_qr);
                    setLocationDesc(data.location_desc);
                    setAssetNumber(data.asset_number);
                    setAssetDesc(data.asset_desc);
                    setCondition(data.condition);
                    setScanQrDate(data.scan_qr_date);
                }
            } catch (err) {
                console.log('Error Fetching Assets: ' + err)
            }
            setIsLoading(false)
        }
        fetchAsset();
    }, [])

    const saveHandler = async (newCondition) => {
        console.log('Start Save');
        console.log(condition)
        const currTime = moment().format('DD/MM/YYYY HH:mm:ss');
        setCondition(newCondition)
        try {
            const updateDb = await execSql('UPDATE trx_opname SET condition = ?,scan_qr_date=? WHERE transaction_line_id=?', [newCondition, currTime, trxLineId])
            // props.navigation.navigate('ReviewTrxAsset', { locationParam: locParam });
            onToggleSnackBar('Condition successfully updated!')
        } catch (err) {
            console.error(err)
        }
    }

    const deleteHandler = async () => {
        try {
            const deleteDb = await execSql('DELETE FROM trx_opname WHERE transaction_line_id=?', [trxLineId]);
            onToggleSnackBar('Asset deleted successfully!');
            props.navigation.navigate('ReviewTrxAsset', { locationParam: locParam })
        } catch (err) {
            console.error(err)
        }
    }

    const _goBack = () => {
        props.navigation.navigate('ReviewTrxAsset', { locationParam: locParam });
    }

    const onToggleSnackBar = (text) => {
        setSnackMsg(text)
        setSnackVis(true)
    }
    const onDismissSnackBar = () => setSnackVis(false);

    return (
        <View style={{ height: '100%' }}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isLoading}
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
            <Appbar.Header style={{ backgroundColor: 'white' }}>
                <Appbar.BackAction onPress={() => preventDoubleClick(() => _goBack())} color={PRIMARY} />
                <Appbar.Content title="Edit Transaction" color={PRIMARY} />
                {/* <Appbar.Action icon="upload" color={PRIMARY} onPress={() => preventDoubleClick(() => saveHandler())} /> */}
                <Appbar.Action icon="home" color={PRIMARY} onPress={() => preventDoubleClick(() => props.navigation.navigate('Home'))} />
            </Appbar.Header>
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
                                                value={location}
                                                editable={false}
                                            ></TextInput>
                                        </View>
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
                                                value={locationDesc}
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
                                                value={assetNumber}
                                                editable={false}
                                            ></TextInput>
                                        </View>
                                    </View>
                                    <View style={styles.buttonWrapper}>
                                        <TouchableOpacity
                                            style={styles.buttonAction}
                                            onPress={() => Alert.alert('Delete Transaction', 'Are you sure to delete Asset Number: ' + assetNumber + ' from opname transaction?', [{ text: 'No' }, { text: 'Yes', onPress: () => preventDoubleClick(() => deleteHandler()) }])}
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
                                                value={assetDesc}
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
                                                    saveHandler(itemValue)
                                                }}
                                                selectedValue={condition}
                                                mode="dialog"
                                                enabled={location ? true : false}
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
                                                value={scanQrDate}
                                            ></TextInput>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
            <View style={{ width: '100%', position: 'absolute', bottom: 0 }}>
                <Snackbar
                    visible={snackVis}
                    onDismiss={() => onDismissSnackBar()}
                    duration={3000}
                >
                    {snackMsg}
                </Snackbar>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    body: {
        height: '95%',
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
    }
})

export default ReviewTrxEdit;