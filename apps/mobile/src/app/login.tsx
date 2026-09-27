import Constants from 'expo-constants';
import { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

const { apiBaseUrl, googleWebClientId, googleIosClientId } = Constants.expoConfig?.extra ?? {};

GoogleSignin.configure({
  webClientId: googleWebClientId,
  iosClientId: googleIosClientId,
});

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setResult(null);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        setResult('로그인이 취소되었습니다.');
        return;
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        setResult('idToken을 받지 못했습니다.');
        return;
      }

      const apiResponse = await fetch(`${apiBaseUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const body = await apiResponse.json();
      setResult(`[${apiResponse.status}] ${JSON.stringify(body, null, 2)}`);
    } catch (error: any) {
      const code = error?.code;
      setResult(code ? `구글 로그인 에러 (${code})` : String(error?.message ?? error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>구글 로그인 테스트</Text>
      <Button title="Sign in with Google" onPress={handleGoogleSignIn} disabled={loading} />
      {loading && <ActivityIndicator style={styles.spacing} />}
      {result && <Text style={styles.result}>{result}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  title: { fontSize: 20, fontWeight: '600' },
  spacing: { marginTop: 12 },
  result: { marginTop: 12, fontFamily: 'monospace' },
});
