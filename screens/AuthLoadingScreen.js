import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { PRIMARY } from '../assets/Colors';

const AuthLoadingScreen = props => {
    useEffect(() => {
        const _startAuth = async () => {
            const userId = await AsyncStorage.getItem('confLoginId')

            props.navigation.navigate(userId ? 'Home' : 'Auth')
        }
        _startAuth()
    }, [])
    return (
        <View style={styles.loading}>
            <ActivityIndicator style={styles.activity} size='large' color={PRIMARY} />
        </View>
    )
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    activity: {
        width: 22,
        height: 22
    }
})

export default AuthLoadingScreen;