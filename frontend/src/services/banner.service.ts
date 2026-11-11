import { apiClient } from '@/lib/api/axios';
import { ApiResponse } from '@/types';

export interface BannerConfig {
  title: string;
  year?: number;
  subtitle?: string;
  tag?: string;
  modelType?: 'SKETCHFAB' | 'IMAGE';
  sketchfabId?: string;
  sketchfabUrl?: string;
  fallbackImageUrl?: string;
  bgImageUrl?: string;
  pricePerDay?: number;
  seats?: number;
  fuel?: string;
  transmission?: string;
  ctaText?: string;
  ctaLink?: string;
  autoRotate?: boolean;
  isActive?: boolean;
}

export const BANNER_BG_PRESETS = [
  {
    id: 'showroom_luxury',
    name: 'Showroom Ô Tô Sang Trọng',
    description: 'Showroom cao cấp, ánh sáng trung tính làm tôn lên màu xe và phản quang kim loại',
    url: '/images/banners/showroom_luxury.jpg',
  },
  {
    id: 'villa_sunset',
    name: 'Biệt Thự Hoàng Hôn',
    description: 'Biệt thự sang trọng với bầu trời hoàng hôn và ánh sáng ấm áp',
    url: '/images/banners/villa_sunset.jpg',
  },
  {
    id: 'modern_hall',
    name: 'Sảnh Triển Lãm Hiện Đại',
    description: 'Kiến trúc kính tối giản, không gian rộng rãi đẳng cấp',
    url: '/images/banners/modern_architectural_hall.jpg',
  },
  {
    id: 'villa_carport',
    name: 'Gara Biệt Thự Ban Đêm',
    description: 'Gara tư gia cao cấp với đèn chiếu rọi điện ảnh',
    url: '/images/banners/villa_carport.jpg',
  },
  {
    id: 'studio_lights',
    name: 'Studio Ánh Sáng Tối',
    description: 'Phong cách huyền bí, tương phản cao',
    url: '/images/banners/studio_lights.jpg',
  },
];

export const DEFAULT_HERO_BANNER: BannerConfig = {
  title: 'Mercedes-Benz W211 E55 AMG',
  year: 2006,
  subtitle: 'V8 Kompressor Huyền Thoại • Gói AMG Cao Cấp',
  tag: 'Mô Hình 3D Tương Tác',
  modelType: 'SKETCHFAB',
  sketchfabId: 'f18053ad7b8347008917423c26391907',
  sketchfabUrl: 'https://sketchfab.com/3d-models/mercedes-benz-w211-e55-wwwvecarzcom-f18053ad7b8347008917423c26391907',
  fallbackImageUrl: 'https://media.sketchfab.com/models/f18053ad7b8347008917423c26391907/thumbnails/49a6dadb5d7c418ea2ccd6117299dbc2/a73aef3fca5a4cb692a58d6266c759d6.jpeg',
  bgImageUrl: '/images/banners/showroom_luxury.jpg',
  pricePerDay: 2200000,
  seats: 5,
  fuel: 'Xăng 5.4L V8 Supercharged (469 HP)',
  transmission: 'Tự động 5G-TRONIC Speedshift',
  ctaText: 'Thuê Xe Ngay',
  ctaLink: '/cars?search=Mercedes',
  autoRotate: true,
  isActive: true,
};

export const bannerService = {
  async getBannerConfig(): Promise<ApiResponse<BannerConfig>> {
    const response = await apiClient.get<ApiResponse<BannerConfig>>('/fleet/banner');
    return response.data;
  },

  async updateBannerConfig(data: BannerConfig): Promise<ApiResponse<BannerConfig>> {
    const response = await apiClient.put<ApiResponse<BannerConfig>>('/fleet/banner', data);
    return response.data;
  },
};

