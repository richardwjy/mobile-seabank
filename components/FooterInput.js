import React, { Component } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import EntypoIcon from "react-native-vector-icons/Entypo";

function FooterInputTrx(props) {
    return (
        <View style={[styles.container, props.style]}>
            <View style={styles.footerBackground}></View>
            <TouchableOpacity style={styles.btnWrapper2} onPress={props.onClickFooterLocation}>
                <EntypoIcon
                    name="aircraft-take-off"
                    style={styles.icon1}
                ></EntypoIcon>
                <Text style={styles.lokasi}>Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnWrapper4} onPress={props.onClickFooterScan}>
                <EntypoIcon
                    name="fingerprint"
                    style={styles.icon3}
                ></EntypoIcon>
                <Text style={styles.scan}>Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnWrapper5} onPress={props.onClickFooterDelete}>
                <EntypoIcon name="trash" style={styles.icon4}></EntypoIcon>
                <Text style={styles.hapus}>Delete</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,1)",
        justifyContent: "space-between"
    },
    footerBackground: {
        top: 0,
        left: 0,
        position: "absolute",
        backgroundColor: "rgba(204,206,211,1)",
        right: 0,
        bottom: 0
    },
    btnWrapper1: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "stretch"
    },
    icon: {
        backgroundColor: "transparent",
        opacity: 0.8,
        fontSize: 24
    },
    kondisi: {
        backgroundColor: "transparent",
        paddingTop: 4,
        fontSize: 12,
        fontFamily: "SFProText-Regular"
    },
    btnWrapper2: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "stretch"
    },
    icon1: {
        backgroundColor: "transparent",
        opacity: 0.8,
        fontSize: 24,
        color: "rgba(80,85,92,1)"
    },
    lokasi: {
        backgroundColor: "transparent",
        paddingTop: 4,
        fontSize: 12,
        fontFamily: "SFProText-Regular",
        color: "rgba(80,85,92,1)"
    },
    btnWrapper4: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "stretch"
    },
    icon3: {
        backgroundColor: "transparent",
        opacity: 0.8,
        fontSize: 24,
        color: "rgba(80,85,92,1)"
    },
    scan: {
        backgroundColor: "transparent",
        paddingTop: 4,
        fontSize: 12,
        fontFamily: "SFProText-Regular",
        color: "rgba(80,85,92,1)"
    },
    btnWrapper5: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "stretch"
    },
    icon4: {
        backgroundColor: "transparent",
        opacity: 0.8,
        fontSize: 24,
        color: "rgba(80,85,92,1)"
    },
    hapus: {
        backgroundColor: "transparent",
        paddingTop: 4,
        fontSize: 12,
        fontFamily: "SFProText-Regular",
        color: "rgba(80,85,92,1)"
    }
});

export default FooterInputTrx;