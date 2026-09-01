import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useDelivery } from '@/context/DeliveryContext';
import { colors } from '@/theme';
export default function Index(){const{hydrated,token}=useDelivery();if(!hydrated)return <View style={styles.loading}><ActivityIndicator size="large" color={colors.forest}/></View>;return <Redirect href={token?'/(tabs)':'/login'}/>}
const styles=StyleSheet.create({loading:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:colors.cream}});
