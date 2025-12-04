import {View, Text, TouchableOpacity} from 'react-native'
import React from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {colors} from "@/constants/constants";
import {Menu, MenuItem, MenuItemLabel} from "@/components/ui/menu";
import {useLibraryStore} from "@/zustand/libraryStore";
import {sortBooksByAuthor, sortBooksByLastRead, sortBooksByTitle} from "@/lib/utils";

const SortButton = () => {
    const SORT_OPTIONS = [
        "Sort By Title",
        "Sort By Author",
        "Sort By Last Read"
    ]

    const {books, setFilteredBooks} = useLibraryStore()

    const handleSort =  (option: string) => {
        switch (option) {
            case "Sort By Title": setFilteredBooks(sortBooksByTitle(books))
                break;
            case  "Sort By Author": setFilteredBooks(sortBooksByAuthor(books))
                break;
            case "Sort By Last Read": setFilteredBooks(sortBooksByLastRead(books))
                break;
        }
    }

    return (
        <Menu
            placement="bottom"
            offset={5}
            trigger={({ ...triggerProps }) => {
                return (
            <TouchableOpacity {...triggerProps}>
                <MaterialCommunityIcons name="sort-bool-ascending" size={21} color={colors.dark} />
            </TouchableOpacity>
                );
            }}
        >
            {SORT_OPTIONS.map((opt) => (
                <MenuItem key={opt} textValue={opt} onPress={() => {handleSort(opt)}}>
                    <MenuItemLabel size="md">{opt}</MenuItemLabel>
                </MenuItem>
            ))}
        </Menu>
    )
}
export default SortButton
