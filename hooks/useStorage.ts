import { STORAGE_KEYS } from "@/lib/storageUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

export const useStorage = () => {
    const [loading, setLoading] = useState(false);

    const fetchBooks = async () => {
        setLoading(true);
        const books: string | null = await AsyncStorage.getItem(STORAGE_KEYS.LIBRARY)
        setLoading(false)
        return JSON.parse(books || '[]');
    }

    const storeBooks = async (books: BookFile[]) => {
        setLoading(true)
        await AsyncStorage.mergeItem(STORAGE_KEYS.LIBRARY, JSON.stringify(books))
        setLoading(false)
    }

    return {
        fetchBooks,
        storeBooks,
    }
} 