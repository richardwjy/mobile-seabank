import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TouchableWithoutFeedback, Modal, ActivityIndicator, FlatList } from 'react-native';
import { PRIMARY, SECONDARY } from '../assets/Colors';

import { Appbar, Button } from 'react-native-paper'

import { preventDoubleClick } from '../components/preventDoubleClick';
import { API_FETCH_CYCLE_HEADER, API_FETCH_TRX_ID, API_POST_SAVE_OPNAME } from '../helpers/api';
import { execSql, getApi } from '../helpers/db';

import OpnameHdr from '../models/OpnameHdr';
import OpnameLn from '../models/OpnameLn';
import OpnameResult from '../models/OpnameResult';

import { MAXLINEBATCH } from '../data/data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

import DeviceInfo from 'react-native-device-info';

const SaveOpname = (props) => {
    const [sumData, setSumData] = useState(0);

    const [loading, setLoading] = useState(false);
    const [viewRows, setViewRows] = useState(false);
    const [trx, setTrx] = useState([])

    let trxObj = [];

    useEffect(() => {
        const getSum = async () => {
            const dbResult = await execSql('SELECT COUNT(1) as sum FROM trx_opname WHERE sent_flag ISNULL;', []);
            if (dbResult.rows.length > 0) {
                setSumData(dbResult.rows.item(0).sum);
            }
        }
        getSum()
    }, [])

    const fetchWithTimeout = async (resource, options) => {
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

    const updateConfLogin = async (trxId) => {
        const asyncUser = await AsyncStorage.getItem('confLoginId')
        const confLoginId = Number(asyncUser);

        const selectDb = await execSql('SELECT * FROM conf_login WHERE conf_login_id=?', [confLoginId])
        let listTrxId = selectDb.rows.item(0).transaction_id;

        if (listTrxId == null) {
            listTrxId = trxId;
        } else {
            listTrxId += ',' + trxId;
        }

        const updateDb = await execSql('UPDATE conf_login SET transaction_id = ? WHERE conf_login_id= ?', [listTrxId, confLoginId])
    }

    const onPressContinue = async () => {
        let cycleHId;
        let cycleStartDt;

        if (sumData == 0) {
            Alert.alert('No Data', 'There is no data to be save', [{ text: 'Okay', style: 'cancel' }])
            return;
        }
        setLoading(true)
        try {
            const dbApiHdr = await getApi(API_FETCH_CYCLE_HEADER);
            const apiHdr = dbApiHdr.rows.item(0).api_url;
            const headerResponse = await fetchWithTimeout(apiHdr, {
                headers: {
                    "Content-type": "application/json"
                },
                timeout: 2000
            })
            const response = await headerResponse.json();
            const headerItem = response;
            cycleHId = headerItem.cycle_hdr_id;
            if (cycleHId == '-1') {
                Alert.alert('Contact Admin', 'There is no Cycle with Open status. Please contact your admin for further information', [{ text: 'Ok', onPress: () => setLoading(false) }])
                return
            }
            cycleStartDt = headerItem.start_date;

            const updTrx = await execSql('UPDATE trx_opname SET cycle_id=?, cycle_opname_date = ?', [cycleHId, cycleStartDt + ''])
            const select = await execSql('SELECT * FROM trx_opname', [])
        } catch (err) {
            console.log(err.name === 'AbortError')
            Alert.alert('Network Error', 'No Connection to APEX Server!', [{ text: 'Ok', onPress: () => setLoading(false) }])
            return
        }

        //Step 1 - Count Line
        const dbRestTrxCtLine = await execSql('SELECT COUNT(1) AS ct FROM trx_opname;');
        const trxCtLine = dbRestTrxCtLine.rows.item(0).ct;
        const userId = await AsyncStorage.getItem('confLoginId');

        //Step 2 - Insert Count Line to Conf Login
        //Notes : trxItem kosong
        try {
            const updTrxOpname = await execSql('UPDATE conf_login SET trx_count_line = ? WHERE conf_login_id = ?', [Number(trxCtLine), Number(userId)])
        } catch (err) {
            console.log('Save Opname - Update Transaction Id Error');
            console.log(err);
        }

        //Step 3 - Batching Line
        //3.1 - Batching Line
        //3.2 - Set TrxObj (For Modal View)

        //3.1
        try {
            const updateResult = await execSql('UPDATE trx_opname SET batch_id = (((transaction_line_id-1)/?)+1) WHERE 1=1;', [MAXLINEBATCH])
            console.log('Save Opname - Update batch success!');
        } catch (err) {
            console.log('Save Opname - Error saving opname!');
            console.log(err)
        }

        //3.2
        try {
            const groupResult = await execSql('SELECT batch_id, COUNT(1) as ctLine FROM trx_opname WHERE sent_flag IS NULL GROUP BY batch_id;', [])
            const groupData = groupResult.rows.raw();
            groupData.map((item, index) => trxObj.push(new OpnameResult(index, item.ctLine, 'L', '')));
            setTrx(trxObj);
        } catch (err) {
            console.log('Grouping data Error')
            console.log(err);
        }

        //Step 4 - Prepare for sending data
        //1. Get device Fingerprint Id
        //2. Get username from conf_login
        //3. Set min and max for looping

        //4.1
        const device_id = await DeviceInfo.getFingerprint();
        const fingerprintDevice = device_id.split('/')[3];
        console.log('Device Id: ' + device_id.split('/')[3]);

        //4.2
        const username = await AsyncStorage.getItem('username')


        //4.3
        const dbMin = await execSql('SELECT MIN(batch_id) as min FROM trx_opname WHERE sent_flag IS NULL')
        const dbMax = await execSql('SELECT MAX(batch_id) as max FROM trx_opname WHERE sent_flag IS NULL')

        const minBatch = dbMin.rows.item(0).min
        const maxBatch = dbMax.rows.item(0).max

        let jsonObj = {};
        let opnameObj = [];

        let j = 0;
        for (let i = minBatch; i <= maxBatch; i++) {
            const dbSendResult = await execSql('SELECT * FROM trx_opname WHERE batch_id=? and sent_flag IS NULL;', [i]);
            const sendData = dbSendResult.rows.raw();
            const totalSendData = dbSendResult.rows.length;
            if (totalSendData == 0) { continue }

            //Get TrxId
            const dbApiTrx = await getApi(API_FETCH_TRX_ID);
            const apiTrx = dbApiTrx.rows.item(0).api_url;
            const trxResponse = await fetchWithTimeout(apiTrx, {
                "headers": {
                    "Content-type": "application/json"
                },
                timeout: 3000
            })
            const trxJson = await trxResponse.json();
            const trxItem = trxJson.items[0]; //cek lagi

            await updateConfLogin(trxItem.transaction_id)

            let opnameHdr = new OpnameHdr(trxItem.transaction_id, fingerprintDevice, totalSendData, cycleStartDt, cycleHId);
            let opnameLn = sendData.map(data => new OpnameLn(data.condition, data.location_qr, data.asset_number, data.scan_qr_date, data.transaction_line_id, username))
            opnameHdr.opname_ln = opnameLn;
            opnameObj.push(opnameHdr);

            jsonObj = { "opname_hdr": opnameObj };

            console.log(sendData)
            console.log(JSON.stringify(jsonObj))
            try {
                const dbApiSave = await getApi(API_POST_SAVE_OPNAME);
                const apiSave = dbApiSave.rows.item(0).api_url;
                console.log(apiSave)
                const postRequest = await fetch(apiSave, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(jsonObj)
                })
                console.log('Data')
                console.log(postRequest);
                const postResponse = await postRequest.json();
                console.log('Post Response')
                console.log(postResponse);
                if (postResponse.status == 'S') {
                    const setSuccess = await execSql('UPDATE trx_opname SET sent_flag=? WHERE batch_id=? AND sent_flag IS NULL', ['TRUE', i])
                    trxObj[j].status = 'S';
                } else {
                    trxObj[j].status = 'E';
                    trxObj[j].errMsg = postResponse.errmsg
                    console.log(postResponse)
                }
                j++;
                //setTrx(trxObj);
                opnameObj.shift();
            } catch (err) {
                console.log('Error Post Request');
                console.log(err);
                Alert.alert('Server Error', 'APEX server is not responding!', [{ text: 'Back', onPress: () => props.navigation.navigate('Home') }])
                return;
            }
        }
        setViewRows(true)
    }

    const renderMenuItem = (itemData) => {
        return (
            <TouchableWithoutFeedback onPress={() => itemData.item.status == 'E' ? Alert.alert('Error', itemData.item.errMsg.replace(/,/g, "\n"), [{ text: 'Oke', style: 'cancel' }]) : null}>
                <View style={[styles.card, { backgroundColor: itemData.item.status == 'S' ? '#9fe6a0' : (itemData.item.status == 'E' ? '#f54748' : null) }]}>
                    {itemData.item.status == 'L' ? <ActivityIndicator size='small' color='#FB8C00' /> : null}
                    {itemData.item.status == 'S' ? <Icon name="md-checkmark-circle-outline" size={20} /> : null}
                    {itemData.item.status == 'E' ? <Icon name="md-close-circle-outline" size={20} /> : null}
                    <View style={styles.textBatch}>
                        <Text>Batch - {(itemData.item.id + 1).toString()}</Text>
                    </View>
                    <View style={styles.textCount}>
                        {itemData.item.status == 'E'
                            ?
                            <Text>{itemData.item.errMsg}</Text>
                            :
                            <Text>{itemData.item.jumlahData.toString()}</Text>
                        }
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }

    const backHandler = async () => {
        try {
            const dbResult = await execSql('DELETE FROM trx_opname WHERE sent_flag = ?', ['TRUE']);
        } catch (err) {
            console.log('Error Remove Trx Opname')
            console.log(err);
        }
        props.navigation.navigate("Home")
    }

    const _goBack = () => {
        props.navigation.navigate('Home')
    }

    return (
        <View>
            <Appbar.Header style={{ backgroundColor: 'white' }}>
                <Appbar.BackAction onPress={() => preventDoubleClick(() => _goBack())} color={PRIMARY} />
                <Appbar.Content title="Save Opname" color={PRIMARY} />
            </Appbar.Header>
            <View style={styles.container}>
                <Modal animationType="slide" transparent={true} visible={loading}
                    onRequestClose={() => {
                        setLoading(!loading);
                    }}
                >
                    <View style={
                        {
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.8)',
                        }
                    }>
                        <View style={{
                            height: '35%',
                            width: '80%',
                        }}>
                            <View style={{
                                backgroundColor: "white",
                                height: '100%',
                                borderRadius: 5,
                                padding: 5,
                                alignItems: "center",
                                justifyContent: 'center',
                            }}>
                                {console.log(trx)}
                                {!viewRows &&
                                    <ActivityIndicator size='large' color={PRIMARY} />
                                }
                                {viewRows &&
                                    <FlatList
                                        data={trx}
                                        renderItem={renderMenuItem}
                                        keyExtractor={item => item.id.toString()}
                                    />
                                }
                                {
                                    viewRows &&
                                    <Button color='red' mode='outlined' onPress={() => Alert.alert('Exit', 'You will head back to Home Screen. If there is an error, inform the Opname Admin for further information.', [{ text: 'Okay', onPress: () => backHandler() }])}>
                                        Exit
                                    </Button>
                                }
                            </View>
                        </View>
                    </View>
                </Modal>
                <View style={styles.content}>
                    <View>
                        <Text style={styles.text}>
                            {/* Proses ini akan mengirim data ke server cloud (APEX).  
                            Setelah data terkirim maka data akan terhapus. 
                            Apabila terjadi error dapat menghubungi admin opname untuk informasi lebih lanjut. 
                            Tekan Tombol "Kirim" untuk melanjutkan! */}
                            This page is use to send data to APEX Server.
                            All data will be deleted after this process has been completed.
                            If there is an error, please inform Opname Admin for further information.
                            Click <View style={{ backgroundColor: SECONDARY, borderRadius: 5, padding: 5 }}><Text style={{ color: 'white' }}>Send</Text></View> button below to continue!
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.textData}>Total data : {sumData} </Text>
                    </View>
                    <View>
                        <Text style={styles.alert}>
                            {/* Selama Proses Pengiriman mohon tidak Keluar dari Aplikasi Atau
                            mematikan handphone! */}
                            During the process, Do not quit the application!
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => onPressContinue()}
                        style={styles.submitBtn} >
                        <Text style={{ color: 'white', fontSize: 20 }}>
                            Send
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '80%',
        height: '100%',
        alignItems: 'center',
        marginTop: 50
    },
    text: {
        fontSize: 17,
        textAlign: 'center'
    },
    textData: {
        color: "#121212",
        width: 321,
        fontSize: 20,
        height: 59,
        marginTop: 9,
        textAlign: 'center'
    },
    alert: {
        color: "rgba(249,6,6,1)",
        fontSize: 17,
        textAlign: "center",
        marginTop: 12,
        alignSelf: "center"
    },
    submitBtn: {
        backgroundColor: SECONDARY,
        marginTop: 20,
        width: 150,
        height: 30,
        borderRadius: 5,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    card: {
        backgroundColor: 'yellow',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 30,
        borderRadius: 5,
        marginVertical: 5,
        padding: 5
    },
    textBatch: {
        width: '40%',
    },
    textCount: {
        width: '50%'
    }
})

export default SaveOpname;