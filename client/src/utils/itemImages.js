// Smart Curated Item Image Resolver for OurThings

const IMAGE_MAP = {
  drill: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
  crutches: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
  projector: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
  rucksack: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80',
  speaker: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
  wheelchair: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80',
  bpMonitor: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=600&q=80',
  ladder: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80',
  camera: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
  tent: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=600&q=80',
};

const CATEGORY_DEFAULT_IMAGES = {
  'Healthcare & Mobility': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
  'Tools & Hardware': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
  'Electronics': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
  'Travel Gear': 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80',
  'Event Equipment': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
};

export function getItemImageUrl(item) {
  if (!item) return IMAGE_MAP.drill;
  if (item.imageUrl && item.imageUrl.trim().length > 5) {
    return item.imageUrl.trim();
  }

  const titleLower = (item.title || '').toLowerCase();

  if (/drill|impact|hammer|saw|drill kit|bosch|dewalt/i.test(titleLower)) {
    return IMAGE_MAP.drill;
  }
  if (/crutch|crutches|walker|walking aid|mobility/i.test(titleLower)) {
    return IMAGE_MAP.crutches;
  }
  if (/projector|epson|beamer|display/i.test(titleLower)) {
    return IMAGE_MAP.projector;
  }
  if (/rucksack|backpack|trekking|wildcraft|suitcase|luggage/i.test(titleLower)) {
    return IMAGE_MAP.rucksack;
  }
  if (/speaker|pa|mic|microphone|jbl|audio|sound/i.test(titleLower)) {
    return IMAGE_MAP.speaker;
  }
  if (/wheelchair/i.test(titleLower)) {
    return IMAGE_MAP.wheelchair;
  }
  if (/blood pressure|bp|omron|monitor|sphygmo/i.test(titleLower)) {
    return IMAGE_MAP.bpMonitor;
  }
  if (/ladder|step ladder/i.test(titleLower)) {
    return IMAGE_MAP.ladder;
  }
  if (/camera|dslr|lens|tripod/i.test(titleLower)) {
    return IMAGE_MAP.camera;
  }
  if (/tent|camping|sleeping bag/i.test(titleLower)) {
    return IMAGE_MAP.tent;
  }

  if (item.category && CATEGORY_DEFAULT_IMAGES[item.category]) {
    return CATEGORY_DEFAULT_IMAGES[item.category];
  }

  return IMAGE_MAP.drill;
}

