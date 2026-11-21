import { useState } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import { multiply } from 'bugsy-react-native';

const result = multiply(3, 7);

export default function App() {
  const [status, setStatus] = useState('No request yet');

  // Manual check for DEB-84: this fetch() should show up in Bugsy's request list
  // with no extra setup on the app's side.
  const sendRequest = async () => {
    setStatus('Sending...');
    try {
      const response = await fetch('https://httpbin.org/get');
      setStatus(`GET -> ${response.status}`);
    } catch (error) {
      setStatus(`Failed: ${(error as Error).message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
      <Button title="Send fetch()" onPress={sendRequest} />
      <Text>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});
