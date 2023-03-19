import React, { Component, useState, useEffect } from "react";

import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,
    TextInput

} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

function HomeHeader(props) {
    // const [username, setUsername] = useState();
    // const [opnameType, setOpnameType] = useState();
    // const [unitId, setUnitId] = useState();
    // const [unitDesc, setUnitDesc] = useState();

    return (
        <View style={[styles.container, props.style]}>
            <View style={styles.header}>
                <View style={styles.leftWrapper}>
                    <View style={styles.seabankLogo}>
                        <Image
                            source={require("../assets/images/seabank-1.jpg")}
                            resizeMode="contain"
                            style={styles.image}
                        ></Image>
                        {/* <Text style={styles.seabank}>Seabank</Text> */}
                    </View>
                </View>
                <View style={[styles.rightWrapper]}>
                    <TouchableOpacity style={styles.button} onPress={props.onPressLogout}>
                        <Icon name="logout" style={styles.icon}></Icon>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.textWrapper}>
                <Text numberOfLines={1} style={styles.name}>
                    Hi, {props.username}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingRight: 8,
        paddingLeft: 8,
        height: '23%',
        elevation: 10
    },
    header: {
        width: '100%',
        height: 40,
        top: 0,
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    leftWrapper: {
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "center",
        height: 44,
        width: 266
    },
    seabankLogo: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        justifyContent: "flex-start",
        backgroundColor: "rgba(255,255,255,1)",
        borderRadius: 15,
        padding: 2
    },
    image: {
        width: '35%',
        height: 28,
        paddingLeft: 2,
        borderRadius: 10
    },
    seabank: {
        fontFamily: "SFProText-Heavy",
        color: "rgba(0,0,0,1)",
        fontSize: 15,
        paddingRight: 5,
        marginLeft: 3
    },
    rightWrapper: {
        alignItems: "flex-end",
        justifyContent: "center"
    },
    button: {
        height: 35,
        width: 38,
        alignItems: "flex-end"
    },
    icon: {
        color: "rgba(255,255,255,1)",
        fontSize: 32,
        height: 35,
        width: 32,
        alignSelf: "center"
    },
    textWrapper: {
        height: '30%',
        paddingLeft: 5,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    name: {
        fontSize: 28,
        fontFamily: "SFProText-Semibold",
        lineHeight: 40,
        color: "rgba(255,255,255,1)"
    },
    infoText: {
        color: "rgba(255,255,255,1)",
        fontSize: 13
    }
});

export default HomeHeader;
