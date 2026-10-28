import { useEffect, useState } from 'react';
import { Platform, type ImageSourcePropType } from 'react-native';
import { resolveLibraryImage } from './libraryImages';

export function useStoryArtworkSource(uri: string | undefined): ImageSourcePropType | undefined {
  const remote = uri ? resolveLibraryImage(uri) ?? (/^https?:\/\//u.test(uri) ? { uri } : undefined) : undefined;
  const [local, setLocal] = useState<{ original: string; uri: string } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  useEffect(() => {
    if (!uri || !remote || Platform.OS === 'web') return;
    let active = true;
    void import('./storyArtworkCache').then(({ ensureStoryArtworkFile }) => ensureStoryArtworkFile(uri))
      .then((file) => { if (active) setLocal({ original: uri, uri: file.uri }); })
      .catch(() => { if (active) setFailed(uri); });
    return () => { active = false; };
  }, [uri, Boolean(remote)]);
  if (Platform.OS === 'web' || failed === uri) return remote;
  return local && local.original === uri ? { uri: local.uri } : undefined;
}
