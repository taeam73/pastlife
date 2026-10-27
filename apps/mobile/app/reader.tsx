import { Redirect } from 'expo-router';

// The 3.0 result contains its own paginated reader.
export default function ReaderRedirect() {
  return <Redirect href="/result" />;
}
