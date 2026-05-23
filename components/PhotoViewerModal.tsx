import { Modal, Pressable, ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';

const { width: W, height: H } = Dimensions.get('window');

interface Props {
  uri: string | null;
  visible: boolean;
  onClose: () => void;
}

export default function PhotoViewerModal({ uri, visible, onClose }: Props) {
  if (!uri) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar style="light" />
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          maximumZoomScale={4}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          centerContent
          bouncesZoom
        >
          <Image
            source={{ uri }}
            style={styles.photo}
            contentFit="contain"
          />
        </ScrollView>

        <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    width: W,
    height: H,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: H,
  },
  photo: {
    width: W,
    height: H,
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
