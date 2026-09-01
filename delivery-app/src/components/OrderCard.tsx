import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, money, radius, shadow, spacing } from '@/theme';
import type { Order } from '@/types';

export function OrderCard({ order }: { order: Order }) {
  return <Pressable onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })} style={styles.card}>
    <View style={styles.top}><View><Text style={styles.number}>{order.orderNumber}</Text><Text style={styles.slot}>{order.deliverySlot}</Text></View><Status value={order.status}/></View>
    <View style={styles.route}><View style={styles.pin}><Ionicons name="location" size={18} color={colors.forest}/></View><View style={styles.copy}><Text style={styles.customer}>{order.address.recipient}</Text><Text style={styles.address} numberOfLines={2}>{order.address.line1}, {order.address.city} - {order.address.pincode}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.muted}/></View>
    <View style={styles.bottom}><Text style={styles.items}>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items • {order.paymentMethod}</Text><Text style={styles.total}>{money(order.total)}</Text></View>
  </Pressable>;
}
export function Status({ value }: { value: string }) { return <View style={[styles.status, value === 'OUT_FOR_DELIVERY' ? styles.blue : value === 'DELIVERED' ? styles.green : styles.gold]}><View style={styles.dot}/><Text>{value.replaceAll('_',' ')}</Text></View>; }
const styles = StyleSheet.create({ card:{backgroundColor:colors.white,borderRadius:radius.lg,padding:spacing.lg,borderWidth:1,borderColor:colors.line,...shadow},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},number:{fontSize:15,fontWeight:'900',color:colors.ink},slot:{fontSize:10,color:colors.muted,marginTop:3},status:{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:8,paddingVertical:5,borderRadius:radius.pill},statusText:{},gold:{backgroundColor:colors.paleGold},blue:{backgroundColor:'#E7F1F8'},green:{backgroundColor:colors.paleGreen},dot:{width:5,height:5,borderRadius:3,backgroundColor:colors.forest},route:{flexDirection:'row',alignItems:'center',marginTop:spacing.lg,paddingTop:spacing.lg,borderTopWidth:1,borderTopColor:colors.line},pin:{width:38,height:38,borderRadius:radius.md,backgroundColor:colors.paleGreen,alignItems:'center',justifyContent:'center'},copy:{flex:1,marginHorizontal:spacing.md},customer:{color:colors.ink,fontSize:12,fontWeight:'800'},address:{color:colors.muted,fontSize:9,lineHeight:14,marginTop:3},bottom:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:spacing.lg},items:{color:colors.muted,fontSize:9},total:{color:colors.forest,fontSize:14,fontWeight:'900'} });
