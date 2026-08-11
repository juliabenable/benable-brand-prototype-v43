/* 28 Litsea campaign — real reconciled stats (Amber excluded).
   Estimated views/impressions, not deduped unique reach. */

export const BRAND = '28 Litsea';
const I1 = 'https://benable-followers.s3.amazonaws.com/ig-siennapierre-reel-3176745985120116844-full.jpg';
const I2 = 'https://benable-followers.s3.amazonaws.com/ig-siennapierre-reel-3207770097225833451-full.jpg';

export const TOTALS = {
  observedViews: 2970,        // hard observed floor (public TikTok/Reel views)
  engagements: 609,           // likes + comments + shares
  viewER: 20.5,               // 609 / 2970
  benchmark: 6,               // industry avg ER
  reach: { floor: 2970, low: 3800, base: 4700, high: 5500 },
  creators: 4,
  pieces: 13,
};

export const PLATFORM = {
  tiktok: 1853,   // observed TikTok views
  reels: 1117,    // observed IG Reel views
  storyEst: 1700, // base estimate for non-public IG Stories
};

export const CREATORS = [
  {
    name: 'Samantha', handle: '@samanthaglow', pic: I2, top: true, rel: 'Favorite',
    views: 756, eng: 241, er: 31.9, storyEst: 95,
    posts: [
      { plat: 'IG Reel', img: I1, views: 443, eng: 136, er: 30.7 },
      { plat: 'IG Reel', img: I2, views: 13, eng: 0, er: 0 },
      { plat: 'TikTok', img: I1, views: 300, eng: 105, er: 35.0 },
      { plat: 'IG Story', img: I2, story: true },
    ],
  },
  {
    name: 'Lulu Lavender', handle: '@lulu.lavender', pic: I1, rel: 'Repeat',
    views: 848, eng: 181, er: 21.3, storyEst: 0,
    posts: [
      { plat: 'IG Reel', img: I2, views: 215, eng: 30, er: 14.0 },
      { plat: 'TikTok', img: I1, views: 258, eng: 81, er: 31.4 },
      { plat: 'TikTok', img: I2, views: 375, eng: 70, er: 18.7 },
    ],
  },
  {
    name: 'Marina', handle: '@luckymia', pic: I2, rel: 'Repeat',
    views: 572, eng: 85, er: 14.9, storyEst: 253,
    posts: [
      { plat: 'IG Reel', img: I1, views: 446, eng: 68, er: 15.2 },
      { plat: 'TikTok', img: I2, views: 126, eng: 17, er: 13.5 },
      { plat: 'IG Story', img: I1, story: true },
    ],
  },
  {
    name: 'Emma', handle: '@emmaboersma', pic: I1, rel: 'New find',
    views: 794, eng: 102, er: 12.8, storyEst: 1346,
    posts: [
      { plat: 'TikTok', img: I2, views: 237, eng: 24, er: 10.1 },
      { plat: 'TikTok', img: I1, views: 557, eng: 78, er: 14.0 },
      { plat: 'IG Story', img: I2, story: true },
    ],
  },
];

// flat list of every piece of content
export const ALL_POSTS = CREATORS.flatMap((c) => c.posts.map((p) => ({ ...p, creator: c })));
