// app/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useWallet, formatPublicKey, formatSOL } from '../contexts/WalletContext';

interface Challenge {
  id: string;
  title: string;
  description: string;
  stakeAmount: number;
  deadline: Date;
  participants: number;
  prizePool: number;
}

export const HomeScreen = ({ navigation }: any) => {
  const { publicKey, isConnected, balance, connect, disconnect } = useWallet();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userStreak] = useState(7);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: '🌅 Sunrise Snap',
        description: 'Capture a beautiful sunrise photo',
        stakeAmount: 0.1,
        deadline: new Date(Date.now() + 8 * 3600 * 1000),
        participants: 23,
        prizePool: 0.5,
      },
      {
        id: '2',
        title: '🥗 Healthy Meal',
        description: 'Share your nutritious breakfast',
        stakeAmount: 0.05,
        deadline: new Date(Date.now() + 12 * 3600 * 1000),
        participants: 45,
        prizePool: 0.8,
      },
      {
        id: '3',
        title: '💪 Morning Workout',
        description: 'Post evidence of your exercise routine',
        stakeAmount: 0.15,
        deadline: new Date(Date.now() + 10 * 3600 * 1000),
        participants: 18,
        prizePool: 0.3,
      },
    ];
    setChallenges(mockChallenges);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  const formatTimeRemaining = (deadline: Date): string => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
  };

  const handleChallengePress = (challenge: Challenge) => {
    navigation.navigate('ChallengeDetail', { challenge });
  };

  const renderChallengeCard = ({ item }: { item: Challenge }) => (
    <TouchableOpacity 
      style={styles.challengeCard} 
      activeOpacity={0.85}
      onPress={() => handleChallengePress(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <View style={styles.stakeBadge}>
          <Text style={styles.stakeText}>{item.stakeAmount} SOL</Text>
        </View>
      </View>
      <Text style={styles.challengeDescription}>{item.description}</Text>
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Participants</Text>
          <Text style={styles.statValue}>{item.participants}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Prize Pool</Text>
          <Text style={styles.statValue}>{item.prizePool.toFixed(2)} SOL</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Time Left</Text>
          <Text style={styles.statValueWarning}>{formatTimeRemaining(item.deadline)}</Text>
        </View>
      </View>
      <View style={styles.joinButtonPreview}>
        <Text style={styles.joinButtonPreviewText}>Tap to view & join →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SolanaSnap</Text>
          <Text style={styles.headerSubtitle}>Daily Challenges</Text>
        </View>
        <TouchableOpacity
          style={styles.walletButton}
          onPress={isConnected ? disconnect : connect}
        >
          {isConnected ? (
            <View>
              <Text style={styles.walletAddress}>{formatPublicKey(publicKey)}</Text>
              <Text style={styles.walletBalance}>{formatSOL(balance)}</Text>
            </View>
          ) : (
            <Text style={styles.connectText}>Connect Wallet</Text>
          )}
        </TouchableOpacity>
      </View>
      {isConnected && (
        <View style={styles.streakBanner}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakText}>{userStreak} Day Streak!</Text>
            <Text style={styles.streakSubtext}>Keep it going!</Text>
          </View>
        </View>
      )}
      <FlatList
        data={challenges}
        renderItem={renderChallengeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14F195" />}
      />
      {!isConnected && (
        <View style={styles.connectPrompt}>
          <Text style={styles.connectPromptText}>Connect your wallet to join challenges</Text>
          <TouchableOpacity style={styles.connectPromptButton} onPress={connect}>
            <Text style={styles.connectPromptButtonText}>Connect Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A0A0A', // ✨ Changed from #000000 - adds subtle depth
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 20, 
    backgroundColor: '#141414', // ✨ Slightly lighter than background
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F', // ✨ Subtle border
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#14F195',
    letterSpacing: -0.5, // ✨ Tighter letter spacing
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: '#888888', 
    marginTop: 4,
    fontWeight: '500', // ✨ Slightly bolder
  },
  walletButton: { 
    backgroundColor: '#9945FF', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12,
    shadowColor: '#9945FF', // ✨ Subtle glow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6, // ✨ Android shadow
  },
  walletAddress: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  walletBalance: { 
    color: '#14F195', 
    fontSize: 11, 
    marginTop: 2,
    fontWeight: '600', // ✨ Bolder
  },
  connectText: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  streakBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#141414', // ✨ Matches header
    marginHorizontal: 20, 
    marginTop: 16, 
    padding: 16, 
    borderRadius: 16, // ✨ More rounded
    borderLeftWidth: 4, 
    borderLeftColor: '#FFD700',
    borderWidth: 1, // ✨ Added border
    borderColor: '#1F1F1F',
    shadowColor: '#FFD700', // ✨ Subtle gold glow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  streakEmoji: { 
    fontSize: 32, 
    marginRight: 12 
  },
  streakText: { 
    color: '#FFD700', 
    fontSize: 18, 
    fontWeight: 'bold',
    letterSpacing: -0.3, // ✨ Tighter
  },
  streakSubtext: { 
    color: '#888888', 
    fontSize: 12, 
    marginTop: 2,
    fontWeight: '500', // ✨ Slightly bolder
  },
  listContent: { 
    padding: 20, 
    paddingBottom: 100 
  },
  challengeCard: { 
    backgroundColor: '#141414', // ✨ Lighter than background
    borderRadius: 20, // ✨ More rounded
    padding: 20, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#1F1F1F', // ✨ Subtle border
    shadowColor: '#000', // ✨ Subtle shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  challengeTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    flex: 1,
    letterSpacing: -0.3, // ✨ Tighter spacing
  },
  stakeBadge: { 
    backgroundColor: '#14F195', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10, // ✨ More rounded
    shadowColor: '#14F195', // ✨ Subtle glow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  stakeText: { 
    color: '#000000', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  challengeDescription: { 
    color: '#AAAAAA', 
    fontSize: 14, 
    marginBottom: 16, 
    lineHeight: 20 
  },
  cardStats: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16, 
    paddingTop: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#1F1F1F', // ✨ Lighter border
  },
  statItem: { 
    flex: 1 
  },
  statLabel: { 
    color: '#666666', 
    fontSize: 11, 
    marginBottom: 4, 
    textTransform: 'uppercase',
    fontWeight: '600', // ✨ Bolder
    letterSpacing: 0.5, // ✨ Slight letter spacing
  },
  statValue: { 
    color: '#14F195', 
    fontSize: 16, 
    fontWeight: '700', // ✨ Bolder
  },
  statValueWarning: { 
    color: '#FF6B6B', 
    fontSize: 16, 
    fontWeight: '700', // ✨ Bolder
  },
  joinButtonPreview: { 
    backgroundColor: '#9945FF', 
    paddingVertical: 14, // ✨ Slightly taller
    borderRadius: 14, // ✨ More rounded
    alignItems: 'center',
    shadowColor: '#9945FF', // ✨ Subtle glow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  joinButtonPreviewText: { 
    color: '#FFFFFF', 
    fontSize: 15, // ✨ Slightly larger
    fontWeight: '700', // ✨ Bolder
  },
  connectPrompt: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#141414', // ✨ Matches header
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#1F1F1F', // ✨ Lighter border
    paddingBottom: 40, // ✨ More padding for gesture area
  },
  connectPromptText: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    marginBottom: 12, 
    textAlign: 'center',
    fontWeight: '500', // ✨ Slightly bolder
  },
  connectPromptButton: { 
    backgroundColor: '#14F195', 
    paddingVertical: 16, // ✨ Taller
    borderRadius: 14, // ✨ More rounded
    alignItems: 'center',
    shadowColor: '#14F195', // ✨ Subtle glow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  connectPromptButtonText: { 
    color: '#000000', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});
