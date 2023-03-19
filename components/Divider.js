import React from 'react';
import { View, StyleSheet } from 'react-native'

const Divider = (props) => {
    return (
        <View
            style={{
                borderBottomColor: 'black',
                borderBottomWidth: StyleSheet.hairlineWidth,
                width: '90%'
            }}
        />
    )
}

export default Divider;