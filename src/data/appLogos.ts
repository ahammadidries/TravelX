import type { ImageSourcePropType } from 'react-native';

const appleIcon = (artworkUrl: string): ImageSourcePropType => ({
  uri: artworkUrl.replace(/\/1200x630wa\.(?:png|jpg)$/, '/512x512bb.webp'),
});
const favicon = (domain: string): ImageSourcePropType => ({
  uri: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
});

// Prefer the bundled store icons for the apps already in assets/apps. Other
// official store icons use the app-store CDN and are cached by expo-image.
export const appLogos: Record<string, ImageSourcePropType> = {
  navitime: appleIcon(
    'https://is5-ssl.mzstatic.com/image/thumb/Purple116/v4/86/ae/14/86ae1496-c78c-a971-ae1d-b0b30cf7e412/AppIcon-0-1x_U007emarketing-0-7-0-sRGB-85-220.png/1200x630wa.png',
  ),
  'tokyo-metro': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/6d/3e/be/6d3ebeb3-4d35-9a1f-1548-ba3a4a75a9f9/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/1200x630wa.jpg',
  ),
  go: appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/40/75/1b/40751b78-dfb3-936d-bd95-f59e70ef2292/AppIcon-0-0-1x_U007epad-0-1-85-220.png/1200x630wa.png',
  ),
  'uber-eats': appleIcon(
    'https://is2-ssl.mzstatic.com/image/thumb/Purple113/v4/94/78/a1/9478a1c2-c846-9917-1e86-5bbc21934837/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220.png/1200x630wa.png',
  ),
  'ubigi-jp': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/96/5b/a8/965ba889-737b-a79e-ee6d-2bfb16351d3f/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/1200x630wa.png',
  ),
  irctc: appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/c4/fc/aa/c4fcaa4b-d2fa-f5b8-9b0c-d6cb5aff3d69/AppIconRelease-0-0-1x_U007emarketing-0-11-0-0-sRGB-85-220.png/1200x630wa.png',
  ),
  ksrtc: appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/53/b8/c6/53b8c63a-0156-5205-54d5-426fe21e4588/AppIcon-0-0-1x_U007emarketing-0-6-0-85-220.png/1200x630wa.png',
  ),
  'uber-clt': appleIcon(
    'https://is5-ssl.mzstatic.com/image/thumb/Purple122/v4/ed/11/14/ed1114e0-570a-2805-d843-12697f4ac57b/AppIcon-0-1x_U007emarketing-0-7-0-85-220.png/1200x630wa.png',
  ),
  'kerala-savaari': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/b9/20/22/b9202258-df85-ea07-0770-9c12be1d2f75/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/1200x630wa.png',
  ),
  swiggy: appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/bc/83/98/bc839820-5088-e365-00ed-6c40a925e9fe/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/1200x630wa.png',
  ),
  airtel: favicon('airtel.in'),
  'google-maps-tokyo': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/52/ff/89/52ff89db-a7b8-85e2-49f0-17d2e878fc86/logo_maps_ios_color-0-1x_U007emarketing-0-0-0-7-0-0-0-0-85-220-0.png/1200x630wa.png',
  ),
  'google-maps-clt': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/52/ff/89/52ff89db-a7b8-85e2-49f0-17d2e878fc86/logo_maps_ios_color-0-1x_U007emarketing-0-0-0-7-0-0-0-0-85-220-0.png/1200x630wa.png',
  ),
  'rapido-kozhikode': require('../../assets/apps/rapido.webp'),
  'zomato-kozhikode': require('../../assets/apps/zomato.webp'),
  'bigbasket-kozhikode': require('../../assets/apps/bigbasket.webp'),
  'where-is-my-train': require('../../assets/apps/where-is-my-train.webp'),
  'jiomart-kozhikode': require('../../assets/apps/jiomart.webp'),
  'google-translate-tokyo': require('../../assets/apps/google-translate.webp'),
  'google-translate-kozhikode': require('../../assets/apps/google-translate.webp'),
  'booking-tokyo': {
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Booking.com_Icon_2022.svg/512px-Booking.com_Icon_2022.svg.png',
  },
  'agoda-tokyo': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/db/a0/d6/dba0d625-c1c5-35fb-f04b-bc7a0aebbc8e/AppIcon-0-0-1x_U007epad-0-1-0-0-0-GLES2_U002c0-85-220.png/1200x630wa.png',
  ),
  'airbnb-tokyo': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/56/9a/82/569a82a9-be91-684c-19b6-98b767923a6a/AppIcon-0-0-1x_U007epad-0-1-0-0-0-85-220.png/1200x630wa.png',
  ),
  'booking-kozhikode': {
    uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Booking.com_Icon_2022.svg/512px-Booking.com_Icon_2022.svg.png',
  },
  'agoda-kozhikode': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/db/a0/d6/dba0d625-c1c5-35fb-f04b-bc7a0aebbc8e/AppIcon-0-0-1x_U007epad-0-1-0-0-0-GLES2_U002c0-85-220.png/1200x630wa.png',
  ),
  'airbnb-kozhikode': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/56/9a/82/569a82a9-be91-684c-19b6-98b767923a6a/AppIcon-0-0-1x_U007epad-0-1-0-0-0-85-220.png/1200x630wa.png',
  ),
  'oyo-kozhikode': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/97/59/f3/9759f34a-b6a8-26c8-fe8f-0890a7cef25a/AppIcon-0-0-1x_U007emarketing-0-6-0-sRGB-85-220.png/1200x630wa.png',
  ),
  'makemytrip-kozhikode': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/b9/6f/9b/b96f9b03-0b84-556f-1933-be5ca886740a/AppIcon-0-0-1x_U007emarketing-0-6-0-85-220.png/1200x630wa.png',
  ),
  'airalo-tokyo': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/74/d6/f2/74d6f201-6e85-081c-c233-0ef2ebdd4f54/AppIcon-0-0-1x_U007ephone-0-1-P3-85-220.png/1200x630wa.png',
  ),
  'holafly-tokyo': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/c6/57/7f/c6577fc0-ec04-8bfb-f658-0a1e893ed673/AppIcon-prod-0-0-1x_U007emarketing-0-11-0-85-220.png/1200x630wa.png',
  ),
  'sakura-mobile-tokyo': favicon('sakuramobile.jp'),
  'airalo-kozhikode': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/74/d6/f2/74d6f201-6e85-081c-c233-0ef2ebdd4f54/AppIcon-0-0-1x_U007ephone-0-1-P3-85-220.png/1200x630wa.png',
  ),
  'holafly-kozhikode': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/c6/57/7f/c6577fc0-ec04-8bfb-f658-0a1e893ed673/AppIcon-prod-0-0-1x_U007emarketing-0-11-0-85-220.png/1200x630wa.png',
  ),
  'myjio-kozhikode': appleIcon(
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/49/e7/7a/49e77a94-0827-aef1-125e-ee0bad62b664/AppIcon-0-0-1x_U007emarketing-0-5-0-85-220.png/1200x630wa.png',
  ),
};
