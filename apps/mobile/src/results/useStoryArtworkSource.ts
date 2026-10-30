import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, type ImageSourcePropType } from 'react-native';
import { resolveLibraryImage } from './libraryImages';

export type StoryArtworkStatus = 'idle' | 'loading' | 'ready' | 'error';
export type StoryArtworkFailure = 'unavailable' | 'download' | 'display' | 'timeout';

export type StoryArtworkState = {
  source: ImageSourcePropType | undefined;
  status: StoryArtworkStatus;
  failure: StoryArtworkFailure | null;
  attempt: number;
  markLoaded: () => void;
  markFailed: () => void;
  retry: () => void;
};

export const STORY_ARTWORK_LOAD_TIMEOUT_MS = 15_000;

export function useStoryArtwork(uri: string | undefined): StoryArtworkState {
  const remote = useMemo(
    () => uri ? resolveLibraryImage(uri) ?? (/^https?:\/\//u.test(uri) ? { uri } : undefined) : undefined,
    [uri],
  );
  const [source, setSource] = useState<ImageSourcePropType | undefined>();
  const [status, setStatus] = useState<StoryArtworkStatus>(uri ? 'loading' : 'idle');
  const [failure, setFailure] = useState<StoryArtworkFailure | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setSource(undefined);
    setFailure(null);
    if (!uri) {
      setStatus('idle');
      return;
    }
    if (!remote) {
      setStatus('error');
      setFailure('unavailable');
      return;
    }
    setStatus('loading');
    if (Platform.OS === 'web') {
      setSource(remote);
      return;
    }
    let active = true;
    void import('./storyArtworkCache').then(({ ensureStoryArtworkFile }) => ensureStoryArtworkFile(uri))
      .then((file) => { if (active) setSource({ uri: file.uri }); })
      .catch(() => {
        if (!active) return;
        // The persistent cache is preferred on native, but a direct remote
        // source still gives React Native one final chance to show the scene.
        setSource(remote);
        setFailure('download');
      });
    return () => { active = false; };
  }, [attempt, remote, uri]);

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = setTimeout(() => {
      setStatus('error');
      setFailure('timeout');
    }, STORY_ARTWORK_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [attempt, status, uri]);

  const markLoaded = useCallback(() => {
    setStatus('ready');
    setFailure(null);
  }, []);

  const markFailed = useCallback(() => {
    setStatus('error');
    setFailure('display');
    if (uri && Platform.OS !== 'web') {
      void import('./storyArtworkCache')
        .then(({ discardStoryArtworkFile }) => discardStoryArtworkFile(uri))
        .catch(() => undefined);
    }
  }, [uri]);

  const retry = useCallback(() => {
    setSource(undefined);
    setFailure(null);
    setStatus(uri ? 'loading' : 'idle');
    setAttempt((current) => current + 1);
  }, [uri]);

  return { source, status, failure, attempt, markLoaded, markFailed, retry };
}
