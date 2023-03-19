import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Modal, ActivityIndicator, TouchableOpacity } from 'react-native';
import { execSql } from '../helpers/db';

import EntypoIcon from "react-native-vector-icons/Entypo";

import { Appbar, Button } from 'react-native-paper';
import { Alert } from 'react-native';
import { PRIMARY } from '../assets/Colors';

const AdminScreen = (props) => {
    const [isLoading, setIsLoading] = useState(false);

    //GET
    const [allApi, setAllApi] = useState('');
    const [cycleHeaderApi, setCycleHeaderApi] = useState('');
    const [locDescApi, setLocDescApi] = useState('');
    const [assetDescApi, setAssetDescApi] = useState('');
    const [trxIdApi, setTrxIdApi] = useState('');

    //POST
    const [loginAuthApi, setLoginAuthApi] = useState('')
    const [saveOpnameApi, setSaveOpnameApi] = useState('')

    useEffect(() => {
        const fetchApiData = async () => {
            const dbRes = await execSql('SELECT * FROM api_list_opname;', []);
            console.log(dbRes)
            if (dbRes.rows.length == 0) {
                //Insert initial data
                try {
                    execSql('INSERT INTO api_list_opname(api_name,api_url) VALUES(?,?);', ['API_GET_ALL', '']).then(res => console.log(res))
                } catch (err) {
                    console.log('error insert all api')
                    console.log(err)
                }
                try {
                    const p1 = await execSql('INSERT INTO api_list_opname(api_name,api_url)VALUES(?,?);', ['API_FETCH_LOCATION_DESC', ''])
                    console.log(p1)
                } catch (err) {
                    console.log('error insert fetch location desc')
                    console.log(err)
                }
                try {
                    const p1 = await execSql('INSERT INTO api_list_opname(api_name,api_url)VALUES(?,?);', ['API_FETCH_ASSET_DESC', ''])
                    console.log(p1)
                } catch (err) {
                    console.log('error insert fetch asset desc')
                    console.log(err)
                }
                try {
                    const p1 = await execSql('INSERT INTO api_list_opname(api_name,api_url)VALUES(?,?);', ['API_FETCH_CYCLE_HEADER', ''])
                    console.log(p1)
                } catch (err) {
                    console.log('error insert fetch header')
                    console.log(err)
                }
                try {
                    const p1 = await execSql('INSERT INTO api_list_opname(api_name,api_url)VALUES(?,?);', ['API_FETCH_TRX_ID', ''])
                    console.log(p1)
                } catch (err) {
                    console.log('error insert trx id')
                    console.log(err)
                }
                try {
                    const p1 = await execSql('INSERT INTO api_list_opname(api_name,api_url)VALUES(?,?);', ['API_POST_LOGIN', ''])
                    console.log(p1)
                } catch (err) {
                    console.log('error insert login')
                    console.log(err)
                }
                try {
                    const p1 = await execSql('INSERT INTO api_list_opname(api_name,api_url)VALUES(?,?);', ['API_POST_SAVE_OPNAME', ''])
                    console.log(p1)
                } catch (err) {
                    console.log('error insert save opname')
                    console.log(err)
                }
                const dbRes = await execSql('SELECT * FROM api_list_opname;', []);
                console.log('after insert')
                console.log(dbRes.rows.raw());
                // await execSql('INSERT INTO API_LIST(api_name)VALUES(?);', ['API_FETCH_UNIT'])
                // await execSql('INSERT INTO API_LIST(api_name)VALUES(?);', ['API_FETCH_CYCLE_HEADER'])
                // await execSql('INSERT INTO API_LIST(api_name)VALUES(?);', ['API_FETCH_CYCLE_LINE'])
                // await execSql('INSERT INTO API_LIST(api_name)VALUES(?);', ['API_FETCH_TRX_ID'])
                // await execSql('INSERT INTO API_LIST(api_name)VALUES(?);', ['API_POST_LOGIN'])
                // await execSql('INSERT INTO API_LIST(api_name)VALUES(?);', ['API_POST_SAVE_OPNAME'])
            }
            //Set Paging Data
            //1. Get previous data di DB
            const q1 = await execSql('SELECT * FROM api_list_opname WHERE api_name =? ', ['API_GET_ALL'])
            const dataQ1 = q1.rows.item(0)
            setAllApi(dataQ1.api_url ? dataQ1.api_url : '')

            const q2 = await execSql('SELECT * FROM api_list_opname WHERE api_name =? ', ['API_FETCH_LOCATION_DESC'])
            const dataQ2 = q2.rows.item(0)
            setLocDescApi(dataQ2.api_url ? dataQ2.api_url : '')

            const q3 = await execSql('SELECT * FROM api_list_opname WHERE api_name =? ', ['API_FETCH_ASSET_DESC'])
            const dataQ3 = q3.rows.item(0)
            setAssetDescApi(dataQ3.api_url ? dataQ3.api_url : '')

            const q4 = await execSql('SELECT * FROM api_list_opname WHERE api_name =? ', ['API_FETCH_CYCLE_HEADER'])
            const dataQ4 = q4.rows.item(0)
            setCycleHeaderApi(dataQ4.api_url ? dataQ4.api_url : '')

            const q5 = await execSql('SELECT * FROM api_list_opname WHERE api_name =? ', ['API_FETCH_TRX_ID'])
            const dataQ5 = q5.rows.item(0)
            setTrxIdApi(dataQ5.api_url ? dataQ5.api_url : '')

            const q6 = await execSql('SELECT * FROM api_list_opname WHERE api_name =? ', ['API_POST_LOGIN'])
            const dataQ6 = q6.rows.item(0)
            setLoginAuthApi(dataQ6.api_url ? dataQ6.api_url : '')

            const q7 = await execSql('SELECT * FROM api_list_opname WHERE api_name =? ', ['API_POST_SAVE_OPNAME'])
            const dataQ7 = q7.rows.item(0)
            setSaveOpnameApi(dataQ7.api_url ? dataQ7.api_url : '')
        }
        fetchApiData()
    }, [])

    const onChangeAllApi = (text) => {
        setAllApi(text)
    }

    const onChangeHeaderApi = (text) => {
        setCycleHeaderApi(text)
    }

    const onChangeLocDescApi = (text) => {
        setLocDescApi(text)
    }

    const onChangeAssetDescApi = (text) => {
        setAssetDescApi(text)
    }

    const onChangeTrxIdApi = (text) => {
        setTrxIdApi(text)
    }

    const onChangeLoginAuthApi = (text) => {
        setLoginAuthApi(text)
    }

    const onChangeSaveOpnameApi = (text) => {
        setSaveOpnameApi(text)
    }

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

    const onClickSave = async () => {

        if (allApi.length == 0) {
            Alert.alert('Empty', 'API is empty, please input the API!', [{ text: "Okay", style: 'cancel' }])
            return
        }
        setIsLoading(true)
        try {
            const response = await fetchWithTimeout(allApi, {
                "headers": {
                    "Content-type": "application/json"
                },
                timeout: 2000
            })
            if (response.ok) {
                const responseJson = await response.json();
                const data = responseJson.items;
                console.log(data);
                data.map(async (item) => {
                    await execSql('UPDATE api_list_opname SET api_url = ? WHERE api_name=?', [item.api_url, item.api_name])
                    if (item.api_name == 'API_FETCH_CYCLE_HEADER') {
                        setCycleHeaderApi(item.api_url)
                    }
                    else if (item.api_name == 'API_FETCH_LOCATION_DESC') {
                        setLocDescApi(item.api_url)
                    }
                    else if (item.api_name == 'API_FETCH_ASSET_DESC') {
                        setAssetDescApi(item.api_url)
                    }
                    else if (item.api_name == 'API_FETCH_TRX_ID') {
                        setTrxIdApi(item.api_url)
                    }
                    else if (item.api_name == 'API_POST_LOGIN') {
                        setLoginAuthApi(item.api_url)
                    }
                    else if (item.api_name == 'API_POST_SAVE_OPNAME') {
                        setSaveOpnameApi(item.api_url)
                    }
                })
            }
            else {
                throw new Error('Something when wrong')
            }
            setIsLoading(false)
        } catch (err) {
            Alert.alert('No Connection', 'There\'s no connection to the API!', [{ text: 'Okay', onPress: () => setIsLoading(false) }])
            return;
        }
    }

    const onClickDelete = async () => {
        setIsLoading(true)
        try {
            execSql('DELETE FROM api_list_opname;')
        } catch (err) {
            console.error(err);
        }
        setIsLoading(false)
    }

    const onClickBack = () => {
        props.navigation.navigate("Auth");
    }

    return (
        <View>
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
                <Appbar.BackAction onPress={() => onClickBack()} color={PRIMARY} />
                <Appbar.Content title="Admin" color={PRIMARY} />
            </Appbar.Header>
            <ScrollView>
                <View style={styles.container}>
                    <View style={{ height: '100%', justifyContent: 'space-around' }}>
                        <View>
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
                                                <Text style={styles.text}>API to All API</Text>
                                            </View>
                                            <View style={styles.textInputWrapper}>
                                                <TextInput
                                                    placeholder="API"
                                                    value={allApi}
                                                    onChangeText={onChangeAllApi}
                                                    style={styles.textInput}
                                                ></TextInput>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            {/* <TouchableOpacity>
                        <Text style={{ textAlign: 'right', color: '#2a86f7' }}>Simpan ></Text>
                    </TouchableOpacity> */}
                            <View style={{ alignItems: 'flex-end' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    {/* <Button
                                        mode="contained"
                                        color="red"
                                        labelStyle={{ color: 'white' }}
                                        style={{ width: 80, borderRadius: 10 }}
                                        labelStyle={{ fontSize: 10 }}
                                        onPress={() => onClickDelete()}>
                                        Delete
                                    </Button> */}
                                    <Button
                                        mode="contained"
                                        color={PRIMARY}
                                        labelStyle={{ color: 'white' }}
                                        style={{ width: 80, borderRadius: 10 }}
                                        labelStyle={{ fontSize: 10 }}
                                        onPress={() => onClickSave()}>
                                        Save
                                </Button>
                                </View>
                                {/* <TouchableOpacity
                                    style={{ backgroundColor: PRIMARY, width: 80, alignItems: 'center' }}
                                >
                                    <Text style={{ color: 'white' }}>Save</Text>
                                </TouchableOpacity> */}
                            </View>
                        </View>
                        <View style={{ backgroundColor: '#e0e0e0', padding: 5, borderRadius: 10 }}>
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
                                                <Text style={styles.text}>Fetch Cycle Header API</Text>
                                            </View>
                                            <View style={styles.textInputWrapper}>
                                                <TextInput
                                                    placeholder="Fetch Cycle Header API"
                                                    value={cycleHeaderApi}
                                                    onChangeText={onChangeHeaderApi}
                                                    style={styles.textInput}
                                                    editable={false}
                                                ></TextInput>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
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
                                                <Text style={styles.text}>Fetch Location Descripiton API</Text>
                                            </View>
                                            <View style={styles.textInputWrapper}>
                                                <TextInput
                                                    placeholder="Location Descripiton API"
                                                    value={locDescApi}
                                                    onChangeText={onChangeLocDescApi}
                                                    style={styles.textInput}
                                                    editable={false}
                                                ></TextInput>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
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
                                                <Text style={styles.text}>Fetch Asset Description</Text>
                                            </View>
                                            <View style={styles.textInputWrapper}>
                                                <TextInput
                                                    placeholder="Fetch Asset Description"
                                                    value={assetDescApi}
                                                    onChangeText={onChangeAssetDescApi}
                                                    style={styles.textInput}
                                                    editable={false}
                                                ></TextInput>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
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
                                                <Text style={styles.text}>Fetch Transaction ID API</Text>
                                            </View>
                                            <View style={styles.textInputWrapper}>
                                                <TextInput
                                                    placeholder="Fetch Transaction Id API"
                                                    value={trxIdApi}
                                                    onChangeText={onChangeTrxIdApi}
                                                    style={styles.textInput}
                                                    editable={false}
                                                ></TextInput>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
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
                                                <Text style={styles.text}>Fetch Login Auth API</Text>
                                            </View>
                                            <View style={styles.textInputWrapper}>
                                                <TextInput
                                                    placeholder="Fetch Login Auth API"
                                                    value={loginAuthApi}
                                                    onChangeText={onChangeLoginAuthApi}
                                                    style={styles.textInput}
                                                    editable={false}
                                                ></TextInput>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
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
                                                <Text style={styles.text}>Post Save Opname API</Text>
                                            </View>
                                            <View style={styles.textInputWrapper}>
                                                <TextInput
                                                    placeholder="Post Save Opname API"
                                                    value={saveOpnameApi}
                                                    onChangeText={onChangeSaveOpnameApi}
                                                    style={styles.textInput}
                                                    editable={false}
                                                ></TextInput>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 75
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
    group: {
        width: 300,
        height: 50,
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
        height: 50
    },
    textWrapper: {
        width: 250,
        height: 25,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.78)",
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderStyle: "dotted"
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
        justifyContent: "flex-start"
    },
    textInput: {
        fontFamily: "SFProText-Regular",
        color: "#121212",
        fontSize: 12,
        width: 233,
    },
})

export default AdminScreen;