import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import HomeScreen from '../screens/HomeScreen';
import InputTransaction from '../screens/InputTransaction';
import ReviewTransaction from '../screens/ReviewTrx';
import ReviewTransactionAsset from '../screens/ReviewTrxAsset';
import ReviewTrxEdit from '../screens/ReviewTrxEdit';
import SaveOpname from '../screens/SaveOpname';
import SignInScreen from '../screens/SignInScreen';
import AdminScreen from '../screens/AdminMenu';

const AppStack = createStackNavigator({
    SaveOpname: {
        screen: SaveOpname,
        navigationOptions: {
            headerShown: false
        }
    },
    InputTrx: {
        screen: InputTransaction,
        navigationOptions: {
            headerShown: false
        }
    },
    ReviewTrx: {
        screen: ReviewTransaction,
        navigationOptions: {
            headerShown: false
        }
    },

    ReviewTrxEdit: {
        screen: ReviewTrxEdit,
        navigationOptions: {
            headerShown: false
        }
    }
})

const AppNavigator = createSwitchNavigator({
    AuthLoading: AuthLoadingScreen,
    Auth: SignInScreen,
    Home: {
        screen: HomeScreen,
        navigationOptions: {
            headerShown: false
        }
    },
    Admin: {
        screen: AdminScreen,
        navigationOptions: {
            headerShown: false
        }
    },
    ReviewTrxAsset: {
        screen: ReviewTransactionAsset,
        navigationOptions: {
            headerShown: false
        }
    },
    App: AppStack
},
    {
        initialRouteName: 'AuthLoading'
    }
)

export default createAppContainer(AppNavigator)