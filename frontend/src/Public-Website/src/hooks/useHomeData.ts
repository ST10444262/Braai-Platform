'use client';

import { useState, useEffect } from 'react';
import { getOptions } from '@/services/HomeService';
import { ProductOptions } from '@/types/home';

export function useHomeData() {
  const [categories, setCategories] = useState<ProductOptions[]>([]);
 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catData] = await Promise.all([
          getOptions(),
        ]);
        setCategories(catData);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return { categories, loading };
}