import Feather from '@expo/vector-icons/Feather';

type HomeTabItem = {
  name: string;
  iconName: keyof typeof Feather.glyphMap;
};

export const home_tab_items: HomeTabItem[] = [
  {
    name: 'index',
    iconName: 'home',
  },
  {
    name: '(library)',
    iconName: 'book-open',
  },
  {
    name: 'bookmarks',
    iconName: 'bookmark',
  },
  {
    name: 'profile/index',
    iconName: 'user',
  },
];
