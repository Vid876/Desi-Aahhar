import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { OrderCard } from '@/components/OrderCard';
import { Screen } from '@/components/Screen';
import { useDelivery } from '@/context/DeliveryContext';
import { colors, spacing } from '@/theme';
export default function History(){const{orders}=useDelivery();const done=orders.filter(o=>['DELIVERED','CANCELLED'].includes(o.status));return <Screen><ScrollView contentContainerStyle={styles.page}><Text style={styles.title}>Delivery history</Text><Text style={styles.sub}>Completed and cancelled assignments</Text><View style={styles.list}>{done.length?done.map(order=><OrderCard key={order.id} order={order}/>):<Text style={styles.empty}>No completed deliveries yet.</Text>}</View></ScrollView></Screen>}
const styles=StyleSheet.create({page:{padding:spacing.lg},title:{fontSize:24,fontWeight:'900',color:colors.ink,marginTop:spacing.lg},sub:{fontSize:10,color:colors.muted,marginTop:4},list:{gap:spacing.md,marginTop:spacing.xl},empty:{padding:spacing.xxl,textAlign:'center',color:colors.muted}});
