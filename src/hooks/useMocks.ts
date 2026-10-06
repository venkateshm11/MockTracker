import { useState, useEffect, useCallback } from 'react';
import { subscribeMocks, addMock, updateMock } from '../firebase/firestore';
import { MockWithId, MockDocument } from '../types/mock';
import { Timestamp } from 'firebase/firestore';

export function useMocks(uid: string | null) {
  const [mocks, setMocks] = useState<MockWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setMocks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeMocks(uid, (data) => {
      setMocks(data);
      setLoading(false);
      setError(null);
    });

    return unsub;
  }, [uid]);

  const addNewMock = useCallback(
    async (data: Omit<MockDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!uid) throw new Error('Not authenticated');
      return addMock(uid, data);
    },
    [uid]
  );

  const editMock = useCallback(
    async (mockId: string, data: Partial<MockDocument>) => {
      if (!uid) throw new Error('Not authenticated');
      return updateMock(uid, mockId, data);
    },
    [uid]
  );

  return { mocks, loading, error, addNewMock, editMock };
}
