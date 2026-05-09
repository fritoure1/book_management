import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { BookForm } from '@/src/components/book-form';
import { useScannerController } from '@/src/hooks/useScannerController';
import { Button } from 'react-native';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { state, actions } = useScannerController();

  if (!permission) return <ThemedView style={styles.container} />;
  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ textAlign: 'center' }}>Caméra requise</ThemedText>
        <Button onPress={requestPermission} title="Accorder" />
      </ThemedView>
    );
  }

  // --- SI UN LIVRE EST SCANNÉ : ON AFFICHE LE COMPOSANT REUTILISABLE ---
  if (state.scannedBook) {
    return (
      <BookForm 
        initialData={state.scannedBook} 
        onSubmit={actions.handleSave} 
        onCancel={actions.handleReset}
        onPickDocument={actions.handlePickDocument}
        fileUri={state.fileUri}
      />
    );
  }

  // --- SINON : ON AFFICHE LA CAMÉRA ---
  return (
    <ThemedView style={styles.container}>
      {state.loading ? (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <ThemedText style={styles.scanText}>Recherche Google Books...</ThemedText>
        </View>
      ) : (
        <CameraView
          style={styles.camera}
          onBarcodeScanned={state.scanned ? undefined : ({ data }) => actions.handleScan(data)}
          barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
        >
           <View style={styles.overlay}>
             <View style={styles.focusedContainer} />
             <ThemedText style={styles.scanText}>Scanner un livre</ThemedText>
           </View>
        </CameraView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  focusedContainer: { width: 250, height: 150, borderWidth: 2, borderColor: '#10b981', borderRadius: 15 },
  scanText: { color: 'white', marginTop: 20, fontSize: 16, fontWeight: 'bold' }
});