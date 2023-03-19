import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import MaterialCommunityIconsIcon from "react-native-vector-icons/MaterialCommunityIcons";
import Svg, { Ellipse } from "react-native-svg";

import { PRIMARY } from '../assets/Colors';

const MenuCard = props => {
    return (
        <View style={[props.style, styles.container]}>
            <TouchableOpacity
                style={styles.button}
                onPress={props.onPress}
            >
                <View style={styles.buttonContent}>
                    <View style={styles.iconGroup}>
                        <View style={styles.svgContainer}>
                            <Svg
                                viewBox="0 0 68.94 68.94"
                                style={styles.ellipseContainer}
                            >
                                <Ellipse
                                    stroke={PRIMARY}
                                    strokeWidth={3}
                                    cx={34}
                                    cy={34}
                                    rx={32}
                                    ry={32}
                                ></Ellipse>
                            </Svg>
                            <MaterialCommunityIconsIcon
                                name={props.menuIcon}
                                style={styles.icon}
                            ></MaterialCommunityIconsIcon>
                            {/* Icon goes here, styles.icon try implementing expo-icons for ease of icon access*/}
                        </View>
                    </View>
                    <Text style={styles.buttonText}>{props.buttonTitle}</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 80,
        height: 80,
    },
    button: {
        backgroundColor: "rgba(255,255,255,1)",
        borderRadius: 10,
        flex: 1
    },
    buttonContent: {
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "space-around",
        flex: 1
    },
    iconGroup: {
        width: 50,
        height: 50,
        alignSelf: "center",
    },
    svgContainer: {
        width: 50,
        height: 50
    },
    ellipseContainer: {
        top: 0,
        width: 50,
        height: 50,
        position: "absolute",
        left: 0
    },
    icon: {
        top: '17%',
        position: "absolute",
        color: PRIMARY,
        fontSize: 30,
        left: '20%'
    },
    buttonText: {
        color: "#121212",
        fontSize: 10,
        alignSelf: "center"
    }
});

export default MenuCard;