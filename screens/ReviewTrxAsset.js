import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { execSql } from '../helpers/db';

import { Appbar, Searchbar } from 'react-native-paper';

import { preventDoubleClick } from '../components/preventDoubleClick';
import { PRIMARY } from '../assets/Colors';

const ReviewTransactionAsset = (props) => {
    const [isLoading, setIsLoading] = useState(false);

    const [assets, setAssets] = useState('');

    const [searchQry, setSearchQry] = useState('');
    const [showedAsset, setShowedAsset] = useState([]);

    const [location, setLocation] = useState();

    useEffect(() => {
        const fetchAsset = async () => {
            setIsLoading(true)
            const locationParam = props.navigation.getParam('locationParam');

            console.log('location param: ' + locationParam)
            setLocation(locationParam);
            try {
                const dbResult = await execSql('SELECT * FROM trx_opname WHERE location_qr=? ORDER BY asset_number;', [locationParam]);
                //const dbResult = await execSql('SELECT * FROM ma_cycle_line WHERE location = ?;', [locationParam]);
                console.log(dbResult.rows.raw())
                if (dbResult.rows.length > 0) {
                    //Set Data asset
                    setAssets(dbResult.rows.raw())
                    setShowedAsset(dbResult.rows.raw())
                }
            } catch (err) {
                console.log('Error Fetching Assets: ' + err)
            }
            setIsLoading(false)
        }
        fetchAsset();
    }, [])

    const onChangeSearch = query => {
        let qry = query.toString();
        // setSearchQry(qry.toString())
        if (assets.length > 0) {
            let arrAsset = assets.filter(asset => asset.asset_number_scan.indexOf(qry) !== -1);
            console.log(arrAsset)
            setShowedAsset(arrAsset)
        }
        setSearchQry(qry)
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => props.navigation.navigate('ReviewTrxEdit', { locationParam: location, assetNumParam: item.asset_number })}
        >
            <View style={styles.cardContainer}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={styles.cardAttribute}>
                        <Text style={styles.textAttribute}>Asset Number</Text>
                    </View>
                    <Text style={styles.textInfo}>{item.asset_number}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={styles.cardAttribute}>
                        <Text style={styles.textAttribute}>Description</Text>
                    </View>
                    <Text style={styles.textInfo}>{item.asset_desc}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )

    return (
        <View>
            <Modal
                animationType="none"
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
                <Appbar.BackAction onPress={() => { props.navigation.navigate('ReviewTrx') }} color={PRIMARY} />
                <Appbar.Content title="Review Transaction" subtitle={location} color={PRIMARY} />
                <Appbar.Action icon="home" color={PRIMARY} onPress={() => preventDoubleClick(() => props.navigation.navigate('Home'))} />
            </Appbar.Header>
            <View style={styles.container}>
                <Searchbar
                    placeholder="Search Asset"
                    onChangeText={onChangeSearch}
                    value={searchQry.toString()}
                    style={{ width: '88%', height: 40 }}
                />
            </View>
            <Text style={styles.textResult}>Result</Text>
            <View style={{ marginLeft: 28, paddingBottom: 50, height: '70%' }}>
                {showedAsset.length > 0 ?
                    <FlatList
                        data={showedAsset}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index}
                    /> :
                    <Text style={{ textAlign: 'center' }}>No Asset</Text>
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
        width: '40%',
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

export default ReviewTransactionAsset;