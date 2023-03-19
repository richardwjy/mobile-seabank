import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { execSql } from '../helpers/db';

import { Appbar, Searchbar } from 'react-native-paper';

import { PRIMARY } from '../assets/Colors';

const ReviewTransaction = (props) => {
    const [isLoading, setIsLoading] = useState(false);

    const [locations, setLocations] = useState('');

    const [searchQry, setSearchQry] = useState('');
    const [showedLocation, setShowedLocation] = useState([]);

    useEffect(() => {
        const fetchLocation = async () => {
            setIsLoading(true)
            try {
                const dbResult = await execSql('SELECT location_qr,location_desc, COUNT(1) as ct FROM trx_opname GROUP BY location_qr ORDER BY location_qr;', []);
                //const dbResult = await execSql('SELECT location,COUNT(1) as ct FROM ma_cycle_line GROUP BY location;', []);
                console.log(dbResult.rows.raw())
                if (dbResult.rows.length > 0) {
                    setLocations(dbResult.rows.raw())
                    setShowedLocation(dbResult.rows.raw())
                }
            } catch (err) {
                console.log('Error Fetching Locations: ' + err)
            }
            setIsLoading(false)
        }
        fetchLocation();
    }, [])

    const onChangeSearch = query => {
        let qry = query.toString();
        // setSearchQry(qry.toString())
        if (locations.length > 0) {
            let arrLoc = locations.filter(loc => loc.location_desc.indexOf(qry) !== -1);
            // let arrLoc = locations.filter(loc => loc.location.indexOf(qry) !== -1);
            console.log(arrLoc)
            setShowedLocation(arrLoc)
        }
        setSearchQry(qry)
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => props.navigation.navigate('ReviewTrxAsset', { locationParam: item.location_qr })}
        //Mapping onPress ke ReviewTransactionAsset dan kirim param berupa data text Location
        >
            <View style={styles.cardContainer}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={styles.cardAttribute}>
                        <Text style={styles.textAttribute}>Location</Text>
                    </View>
                    <Text style={styles.textInfo}>{item.location_qr}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={styles.cardAttribute}>
                        <Text style={styles.textAttribute}>Description</Text>
                    </View>
                    <Text style={styles.textInfo}>{item.location_desc}</Text>
                </View>
            </View >
        </TouchableOpacity>
    )

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
                <Appbar.BackAction onPress={() => { props.navigation.navigate("Home") }} color={PRIMARY} />
                <Appbar.Content title="Review Transaction" color={PRIMARY} />
            </Appbar.Header>
            <View style={styles.container}>
                <Searchbar
                    placeholder="Search Location"
                    onChangeText={onChangeSearch}
                    value={searchQry.toString()}
                    style={{ width: '88%', height: 40 }}
                />
            </View>
            <Text style={styles.textResult}>Result</Text>
            <View style={{ marginLeft: 28, paddingBottom: 50, height: '70%' }}>
                {showedLocation.length > 0 ?
                    <FlatList
                        data={showedLocation}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index}
                    /> :
                    <Text style={{ textAlign: 'center' }}>No Location</Text>
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20
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
    main: {
        borderRadius: 8,
        backgroundColor: '#cecece',
    },
    cardAttribute: {
        width: '35%',
    },
    cardContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 5,
        elevation: 5,
        shadowColor: 'black',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 8,
        margin: 5,
        padding: 10
    },
    cardContent: {
        padding: 5
    },
    textAttribute: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    textInfo: {
        fontSize: 14,
        flex: 1,
        flexWrap: 'wrap'
    },
    textResult: {
        color: "rgba(60,60,67,0.6)",
        fontSize: 16,
        height: 19,
        width: 50,
        marginBottom: 10,
        marginLeft: 38
    }
})

export default ReviewTransaction;