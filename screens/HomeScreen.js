import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native'
import { MENU } from '../data/data';

import HeaderHome from "../components/HeaderHome";
import { PRIMARY } from '../assets/Colors';

import MenuCard from '../components/MenuCard';
import { execSql } from '../helpers/db';

import { Snackbar } from 'react-native-paper'
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = (props) => {
    const [username, setUsername] = useState('')
    const [snackVis, setSnackVis] = useState(false)
    const [snackMsg, setSnackMsg] = useState('')

    const [lastTrx, setLastTrx] = useState()

    useEffect(() => {
        let isSubscribe = true;
        async function _runNow() {
            const userId = await AsyncStorage.getItem('confLoginId');
            let loginResult = '';
            let confUnitResult = '';
            const selectConfLogin = await execSql('SELECT username FROM conf_login WHERE conf_login_id=?;', [Number(userId)])
            setUsername(isSubscribe ? selectConfLogin.rows.item(0).username : null)
        }
        _runNow();
        return () => {
            isSubscribe = false;
        }
    }, [])

    useEffect(() => {
        const getLastTrx = async () => {
            try {
                const dbResult = await execSql('SELECT * FROM trx_opname ORDER BY transaction_line_id DESC LIMIT 5')
                if (dbResult.rows.length > 0) {
                    setLastTrx(dbResult.rows.raw())
                }
            } catch (error) {
                console.log('Home-Error get last trx: ' + error)
                return
            }
        }
        getLastTrx()
    }, [])

    const renderTrxItem = itemData => {
        return (
            <View style={styles.cardContainer}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={styles.cardAttribute}>
                        <Text style={styles.textAttribute}>Location</Text>
                    </View>
                    <Text style={styles.textInfo}>{itemData.item.location_qr}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={styles.cardAttribute}>
                        <Text style={styles.textAttribute}>Asset Number</Text>
                    </View>
                    <Text style={styles.textInfo}>{itemData.item.asset_number}</Text>
                </View>
            </View>
        )
    }

    const onToggleSnackBar = (text) => {
        setSnackMsg(text)
        setSnackVis(true)
    }

    const onDismissSnackBar = () => {
        //setSnackVis(false)
        setSnackMsg('')
        setSnackVis(false)
    }

    const deleteData = async () => {
        const dbResult = await execSql('DELETE FROM trx_opname;', []);
    }

    const selectAll = async () => {
        const currDate = moment().format('DD/MM/YYYY HH:mm:ss')
        for (let i = 1; i < 9; i++) {
            const dbResult = await execSql('INSERT INTO trx_opname(condition,location_qr,location_desc,asset_number,asset_desc,scan_qr_date) VALUES(?,?,?,?,?,?)', ['Not Good', '135', 'Cikini-Test', 'BKEID0000' + i, '-', currDate]);
        }
    }

    const _insertNewConfLogin = async (confLoginId) => {
        const currTime = moment().format('DD/MM/YYYY HH:mm:ss');

        const prevResult = await execSql('SELECT * FROM conf_login WHERE conf_login_id = ?;', [confLoginId]);
        const prevData = prevResult.rows.item(0);
        const newResult = await execSql('INSERT INTO conf_login(username,password,login_date)VALUES(?,?,?);', [prevData.username, prevData.password, currTime]);
        const newUserId = newResult.insertId;

        await AsyncStorage.setItem('confLoginId', String(newUserId));
    }

    const _signOutAsync = async () => {
        const asyncUser = await AsyncStorage.getItem('confLoginId');
        const userId = Number(asyncUser);
        const currTime = moment().format('DD/MM/YYYY HH:mm:ss');

        const dbResult = await execSql('UPDATE conf_login SET end_date= ? WHERE conf_login_id = ?;', [currTime, userId]);
        await AsyncStorage.clear();
        await deleteData();

        props.navigation.navigate('Auth')
    }

    const cancelOpname = async () => {
        const asyncUser = await AsyncStorage.getItem('confLoginId');
        const userId = Number(asyncUser);
        const currTime = moment().format('DD/MM/YYYY HH:mm:ss');

        console.log(userId)
        const dbResult = await execSql('UPDATE conf_login SET cancel_opname_flag=?,end_date= ? WHERE conf_login_id = ?;', ['TRUE', currTime, userId]);
        await deleteData();
        await _insertNewConfLogin(userId);
        onToggleSnackBar('Cancel Opname Success!')
        props.navigation.navigate('AuthLoading')
    }

    const renderMenuItem = itemData => {
        const { menuIcon, menuTitle, navigate, onPress } = itemData.item;

        if (navigate) {
            return (
                <MenuCard
                    buttonTitle={menuTitle}
                    menuIcon={menuIcon}
                    style={{ marginVertical: 5, marginHorizontal: 3 }}
                    onPress={() => props.navigation.navigate(onPress)}
                />
            )
        }
        if (onPress == 'CancelOpname') {
            return (
                <MenuCard
                    buttonTitle={menuTitle}
                    menuIcon={menuIcon}
                    style={{ marginVertical: 5, marginHorizontal: 3 }}
                    onPress={() => Alert.alert('Cancel Opname', 'All transaction will be deleted, are you sure to continue?', [{ text: 'No' }, { text: 'Yes', onPress: () => cancelOpname() }])}
                />
            )
        }
        if (onPress == 'SelectAll') {
            return (
                <MenuCard
                    buttonTitle={menuTitle}
                    menuIcon={menuIcon}
                    style={{ marginVertical: 5, marginHorizontal: 3 }}
                    onPress={() => selectAll()}
                />
            )
        }
    }
    return (
        <View style={{ flex: 1 }}>
            <HeaderHome
                style={[styles.homeHeader, { backgroundColor: PRIMARY }]}
                username={username}
                onPressLogout={() => Alert.alert('Logout', 'Previously scanned data will be deleted, are you sure to logout?', [{ text: 'No', style: 'cancel' }, { text: 'Yes', onPress: () => _signOutAsync() }])}
            ></HeaderHome>

            {/* Menu */}
            <View style={{ alignItems: 'center', height: '73%' }}>
                <View style={styles.menuBackground}>
                    <View style={{ paddingVertical: 10 }}>
                        <FlatList
                            data={MENU}
                            numColumns={3}
                            renderItem={renderMenuItem}
                        />
                    </View>
                </View>
                <View style={styles.lastTrx}>
                    <Text style={{ paddingLeft: 10, color: 'grey' }}>Last Transaction</Text>
                    <FlatList
                        data={lastTrx}
                        renderItem={renderTrxItem}
                        keyExtractor={item => item.transaction_line_id}
                    />
                </View>
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
    menuBackground: {
        width: '90%',
        height: '58%',
        borderRadius: 10,
        backgroundColor: "rgba(60,60,67,0.1)",
        marginTop: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lastTrx: {
        width: '90%',
        height: '35%',
        marginTop: 20,
        borderRadius: 10,
        backgroundColor: "rgba(60,60,67,0.1)",
    },
    homeHeader: {
        width: '100%',
        backgroundColor: "black",
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
    },
    cardContainer: {
        width: '94%',
        backgroundColor: 'white',
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 3,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 2,
        margin: 5,
        padding: 10
    },
    cardAttribute: {
        width: '35%',
    },
    cardInfo: {
        justifyContent: 'space-between'
    },
    textAttribute: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    textInfo: {
        fontSize: 12,
        flex: 1,
        flexWrap: 'wrap'
    },
})

export default HomeScreen;