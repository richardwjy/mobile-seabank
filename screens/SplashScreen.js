import React, { Component } from "react";
import { StyleSheet, View, Text, Image } from "react-native";

function SplashScreenOpen(props) {
    return (
        <View style={styles.container}>
            <View style={styles.inventore1Stack}>
                <Image
                    source={require("../assets/images/seabank-1.jpg")}
                    resizeMode="contain"
                    style={styles.image1}
                ></Image>
                <Text style={styles.loremIpsum1}>Asset Opname</Text>
                {/* <Text style={styles.loremIpsum2}>Seabank</Text> */}
            </View>
            <View style={styles.group2}>
                <View style={styles.powerByTIRow}>
                    <Text style={styles.powerByTI}>Powered By</Text>
                    <Image
                        source={require("../assets/images/image_IxDI..png")}
                        resizeMode="contain"
                        style={styles.metrodataPNG}
                    ></Image>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    group1: {
        top: 226,
        position: "absolute",
        height: 64,
        flexDirection: "row",
        flexWrap: "nowrap",
        alignItems: "stretch",
        justifyContent: "center",
        left: 57
    },
    loremIpsum1: {
        fontFamily: "KaushanScript-Regular",
        color: "black",
        fontSize: 25,
        textAlign: 'center'
    },
    loremIpsum2: {
        fontFamily: "SFProText-Regular",
        color: "black",
        fontSize: 20,
        textAlign: 'center'
    },
    image1: {
        height: 200,
        width: 200
    },
    inventore1Stack: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '75%'
    },
    group2: {
        height: 50,
        width: 115,
        flexDirection: "row",
        alignSelf: "center"
    },
    powerByTI: {
        fontFamily: "SFProText-Regular",
        color: "black",
        fontSize: 15,
        height: 18,
    },
    metrodataPNG: {
        height: 50,
        width: 50
    },
    powerByTIRow: {
        height: 50,
        flexDirection: "row",
        flex: 1,
        marginRight: -1
    }
});

export default SplashScreenOpen;
