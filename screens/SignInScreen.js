import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Modal, TouchableWithoutFeedback, TouchableOpacity, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { Button, TextInput, Snackbar } from 'react-native-paper';
import SplashScreenOpen from './SplashScreen';

import Icon from 'react-native-vector-icons/Entypo';

import { PRIMARY } from '../assets/Colors';
import { API_POST_LOGIN } from '../helpers/api';

import { sha256 } from 'react-native-sha256';
import { execSql, getApi } from '../helpers/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const SignInScreen = (props) => {
    const [splashScreen, setSplashScreen] = useState(true);
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [hashedPass, setHashedPass] = useState();

    const [showPass, setShowPass] = useState(false);

    const [isFocused, setIsFocused] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [snackVis, setSnackVis] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
        Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

        // cleanup function
        return () => {
            Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
            Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
        };
    }, []);

    const _keyboardDidShow = () => setIsFocused(true);
    const _keyboardDidHide = () => setIsFocused(false);

    const onClickEye = () => {
        setShowPass(!showPass)
    }

    const _signInAsync = async () => {
        const currTime = moment().format('DD/MM/YYYY HH:mm:ss');
        console.log(currTime)
        const insertDb = await execSql('INSERT INTO conf_login(username,password,login_date)VALUES (?,?,?);', [username.toString(), hashedPass, currTime])

        await AsyncStorage.setItem('username', username)
        await AsyncStorage.setItem('confLoginId', insertDb.insertId.toString())

        const selectResult = await execSql('SELECT * FROM conf_login;', []);
        console.log(selectResult);
    }

    const onLoginClick = async () => {
        Keyboard.dismiss();
        setIsLoading(true)
        // props.navigation.navigate('Home')
        // return
        if (!username) {
            setIsLoading(false)
            Alert.alert('Incorrect Username', 'Username is empty', [{ text: 'Oke', style: 'cancel' }]);
            return
        } else if (!password) {
            setIsLoading(false)
            Alert.alert('Incorrect Password', 'Password is empty', [{ text: 'Oke', style: 'cancel' }]);
            return
        }

        //Check Admin
        const sysdate = moment().format('YYYYMMDD')
        if (username.toUpperCase() == 'SYSADMIN' && password == sysdate) {
            setIsLoading(false)
            props.navigation.navigate('Admin')
            return;
        } else if (username.toUpperCase() == 'SYSADMIN' && password != sysdate) {
            setIsLoading(false)
            Alert.alert('Wrong Password', 'Please enter the correct password for admin login!', [{ text: 'Okay', onPress: () => setPassword('') }])
            return;
        }

        const hashed = await sha256(password)
        console.log(hashed);
        setHashedPass(hashed.toString())

        const userData = {
            username: username,
            password: hashed.toString()
        }
        console.log(JSON.stringify(userData))
        //Check API login
        try {
            const dbApi = await getApi(API_POST_LOGIN);
            const api = dbApi.rows.item(0).api_url;
            const response = await fetchWithTimeout(api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                timeout: 2000
            })
            console.log(response)
            if (response.ok) {
                const responseJson = await response.json()
                if (responseJson.status == 'FALSE') {
                    onToggleSnackBar(responseJson.errorMessage)
                } else {
                    onToggleSnackBar('Logged In!')
                    await _signInAsync();
                    props.navigation.navigate('Home')
                }
            }
            setIsLoading(false)
        } catch (err) {
            Alert.alert('Network Error', 'No Connection to APEX Server!', [{ text: 'Ok', onPress: () => setIsLoading(false) }])
            return;
        }
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

    const onToggleSnackBar = (text) => {
        console.log(text)
        setMessage(text)
        setSnackVis(true)
    }
    const onDismissSnackBar = () => setSnackVis(false);

    return (
        <View style={styles.container}>
            <Image
                source={require("../assets/images/seabank-1.jpg")}
                resizeMode="contain"
                style={styles.seabankLogo}
            ></Image>
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
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={splashScreen}
            >
                <TouchableWithoutFeedback onPress={() => setSplashScreen(false)}>
                    <View style={styles.splashScreen}>
                        <SplashScreenOpen />
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <Modal
                animationType={'slide'}
                transparent={true}
                visible={!splashScreen}
            >
                <View style={[styles.form, styles.shadow, { height: isFocused ? '100%' : '55%' }]}>
                    <View style={{ width: '100%', height: '65%', justifyContent: 'space-around' }}>
                        <TextInput
                            label="Username"
                            mode="outlined"
                            right={<TextInput.Icon name="account" />}
                            value={username}
                            style={{ backgroundColor: 'white' }}
                            onChangeText={text => setUsername(text)} />
                        <TextInput
                            label="Password"
                            mode="outlined"
                            secureTextEntry={!showPass}
                            right={<TextInput.Icon name="eye" onPress={onClickEye} />}
                            value={password}
                            style={{ backgroundColor: 'white' }}
                            onChangeText={text => setPassword(text)} />
                    </View>
                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={onLoginClick}
                    >
                        <Text style={{ textAlign: 'center', color: 'white' }}>SIGN IN</Text>
                        <Icon name="chevron-right" color="white" size={20} />
                    </TouchableOpacity>
                    <Snackbar
                        visible={snackVis}
                        onDismiss={onDismissSnackBar}
                        duration={3000}
                        action={{
                            label: 'Close'
                        }}>
                        {message}
                    </Snackbar>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
    },
    seabankLogo: {
        height: 175,
        width: 175,
        position: 'absolute',
        top: 30
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
    signInButton: {
        backgroundColor: PRIMARY,
        padding: 10,
        borderRadius: 20,
        width: 125,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    splashScreen: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'yellow'
    },
    form: {
        backgroundColor: 'white',
        position: 'absolute',
        height: '100%',
        width: '95%',
        marginLeft: 8,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
    },
    shadow: {
        shadowColor: "#EA5F00",
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,
        elevation: 24,
    },
})

export default SignInScreen;