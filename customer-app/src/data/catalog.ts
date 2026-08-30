import { Category, Coupon, Product } from '@/types';

export const categories: Category[] = [
  { id: 'atta-rice', name: 'Atta & Rice', hindiName: 'आटा और चावल', emoji: '🌾', color: '#F4E2AD', appliesMinimum: true },
  { id: 'pulses', name: 'Pulses & Grains', hindiName: 'दाल और अनाज', emoji: '🫘', color: '#F1D9BE', appliesMinimum: true },
  { id: 'oil-spices', name: 'Oil & Spices', hindiName: 'तेल और मसाले', emoji: '🌶️', color: '#FAD7BD', appliesMinimum: true },
  { id: 'vegetables', name: 'Vegetables', hindiName: 'ताज़ी सब्ज़ियाँ', emoji: '🥬', color: '#DCEFD6', appliesMinimum: false },
  { id: 'fruits', name: 'Fruits', hindiName: 'ताज़े फल', emoji: '🍎', color: '#FFE1DF', appliesMinimum: false },
  { id: 'dairy', name: 'Dairy', hindiName: 'दूध और डेयरी', emoji: '🥛', color: '#E1EEFA', appliesMinimum: false },
  { id: 'beverages', name: 'Beverages', hindiName: 'चाय और पेय', emoji: '🍵', color: '#E9E0D5', appliesMinimum: true },
  { id: 'personal-care', name: 'Personal Care', hindiName: 'पर्सनल केयर', emoji: '🧼', color: '#E9DFF6', appliesMinimum: true },
];

export const products: Product[] = [
  {
    id: 'chakki-atta', categoryId: 'atta-rice', name: 'Fresh Chakki Atta', hindiName: 'ताज़ा चक्की आटा', emoji: '🌾',
    description: 'Stone-ground whole wheat flour with natural fibre and authentic aroma.', rating: 4.8, reviews: 328, featured: true, badge: 'Bestseller',
    variants: [
      { id: 'atta-5kg', label: '5 kg', price: 285, mrp: 325, stock: 42 },
      { id: 'atta-10kg', label: '10 kg', price: 545, mrp: 620, stock: 20 },
    ],
  },
  {
    id: 'basmati-rice', categoryId: 'atta-rice', name: 'Premium Basmati Rice', hindiName: 'प्रीमियम बासमती चावल', emoji: '🍚',
    description: 'Long-grain aromatic basmati, aged for a fluffy and fragrant result.', rating: 4.7, reviews: 214, featured: true,
    variants: [
      { id: 'rice-5kg', label: '5 kg', price: 649, mrp: 735, stock: 28 },
      { id: 'rice-10kg', label: '10 kg', price: 1249, mrp: 1399, stock: 14 },
    ],
  },
  {
    id: 'toor-dal', categoryId: 'pulses', name: 'Unpolished Toor Dal', hindiName: 'अरहर दाल', emoji: '🫘',
    description: 'Naturally protein-rich, unpolished dal sourced from trusted farms.', rating: 4.9, reviews: 451, featured: true, badge: 'Farm fresh',
    variants: [
      { id: 'toor-1kg', label: '1 kg', price: 189, mrp: 220, stock: 55 },
      { id: 'toor-5kg', label: '5 kg', price: 899, mrp: 1030, stock: 18 },
    ],
  },
  {
    id: 'mustard-oil', categoryId: 'oil-spices', name: 'Kachi Ghani Mustard Oil', hindiName: 'सरसों का तेल', emoji: '🫙',
    description: 'Cold-pressed mustard oil with bold flavour and natural pungency.', rating: 4.6, reviews: 193, featured: true,
    variants: [
      { id: 'oil-1l', label: '1 L', price: 174, mrp: 199, stock: 34 },
      { id: 'oil-5l', label: '5 L', price: 829, mrp: 925, stock: 11 },
    ],
  },
  {
    id: 'tomato', categoryId: 'vegetables', name: 'Fresh Tomato', hindiName: 'ताज़ा टमाटर', emoji: '🍅',
    description: 'Hand-picked, firm and juicy tomatoes delivered fresh.', rating: 4.5, reviews: 120, badge: 'No minimum',
    variants: [{ id: 'tomato-1kg', label: '1 kg', price: 48, mrp: 60, stock: 80 }],
  },
  {
    id: 'potato', categoryId: 'vegetables', name: 'Farm Potato', hindiName: 'आलू', emoji: '🥔',
    description: 'Everyday cooking potatoes, carefully sorted for consistent quality.', rating: 4.7, reviews: 158,
    variants: [
      { id: 'potato-1kg', label: '1 kg', price: 42, mrp: 50, stock: 120 },
      { id: 'potato-5kg', label: '5 kg', price: 189, mrp: 225, stock: 35 },
    ],
  },
  {
    id: 'onion', categoryId: 'vegetables', name: 'Red Onion', hindiName: 'लाल प्याज़', emoji: '🧅',
    description: 'Fresh red onions with a balanced sharp and sweet flavour.', rating: 4.6, reviews: 141,
    variants: [{ id: 'onion-1kg', label: '1 kg', price: 55, mrp: 65, stock: 95 }],
  },
  {
    id: 'banana', categoryId: 'fruits', name: 'Robusta Banana', hindiName: 'केला', emoji: '🍌',
    description: 'Naturally ripened, energy-rich bananas.', rating: 4.5, reviews: 89,
    variants: [{ id: 'banana-6', label: '6 pcs', price: 54, mrp: 65, stock: 60 }],
  },
  {
    id: 'milk', categoryId: 'dairy', name: 'Full Cream Milk', hindiName: 'फुल क्रीम दूध', emoji: '🥛',
    description: 'Rich, creamy and pasteurised fresh milk.', rating: 4.8, reviews: 302, featured: true, badge: 'Daily fresh',
    variants: [
      { id: 'milk-500', label: '500 ml', price: 34, mrp: 34, stock: 50 },
      { id: 'milk-1l', label: '1 L', price: 66, mrp: 66, stock: 40 },
    ],
  },
  {
    id: 'tea', categoryId: 'beverages', name: 'Desi Masala Tea', hindiName: 'देसी मसाला चाय', emoji: '🍵',
    description: 'Strong black tea blended with warming Indian spices.', rating: 4.9, reviews: 267, featured: true,
    variants: [
      { id: 'tea-500', label: '500 g', price: 259, mrp: 299, stock: 23 },
      { id: 'tea-1kg', label: '1 kg', price: 495, mrp: 560, stock: 15 },
    ],
  },
  {
    id: 'turmeric', categoryId: 'oil-spices', name: 'Pure Turmeric Powder', hindiName: 'शुद्ध हल्दी', emoji: '🟡',
    description: 'High-curcumin turmeric with deep colour and earthy aroma.', rating: 4.8, reviews: 176,
    variants: [{ id: 'turmeric-200', label: '200 g', price: 78, mrp: 95, stock: 44 }],
  },
  {
    id: 'soap', categoryId: 'personal-care', name: 'Neem Tulsi Bath Bar', hindiName: 'नीम तुलसी साबुन', emoji: '🧼',
    description: 'A gentle herbal cleansing bar with neem and tulsi extracts.', rating: 4.4, reviews: 72,
    variants: [
      { id: 'soap-1', label: '125 g', price: 52, mrp: 60, stock: 70 },
      { id: 'soap-4', label: 'Pack of 4', price: 189, mrp: 240, stock: 25 },
    ],
  },
];

export const coupons: Coupon[] = [
  { code: 'DESI100', title: '₹100 off', description: 'On orders above ₹999', minimum: 999, discount: 100 },
  { code: 'KIRANA50', title: '₹50 off', description: 'On eligible grocery above ₹500', minimum: 500, discount: 50 },
];
