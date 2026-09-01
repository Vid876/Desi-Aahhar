import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '@/theme';
export default function TabsLayout(){return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:colors.forest,tabBarInactiveTintColor:'#89938D',tabBarStyle:{height:70,paddingTop:7,paddingBottom:9,backgroundColor:colors.white,borderTopColor:colors.line},tabBarLabelStyle:{fontSize:9,fontWeight:'800'}}}>
  <Tabs.Screen name="index" options={{title:'Assignments',tabBarIcon:({color,size})=><Ionicons name="navigate" color={color} size={size}/>}}/>
  <Tabs.Screen name="history" options={{title:'History',tabBarIcon:({color,size})=><Ionicons name="time" color={color} size={size}/>}}/>
  <Tabs.Screen name="profile" options={{title:'Profile',tabBarIcon:({color,size})=><Ionicons name="person" color={color} size={size}/>}}/>
</Tabs>}
