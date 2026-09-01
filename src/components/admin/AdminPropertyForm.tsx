import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, X, Sparkles } from 'lucide-react';
import { Property, Project } from '../../types';
import { PROPERTY_TYPES, PROVINCES, AMENITY_PRESETS, slugify } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { createPropertyAdmin, updatePropertyAdmin } from '../../services/adminService';

interface AdminPropertyFormProps {
  initialProperty?: Property | null;
  projects: Project[];
  onBack: () => void;
  onSaved: () => void;
}

export const AdminPropertyForm: React.FC<AdminPropertyFormProps> = ({
  initialProperty,
  projects,
  onBack,
  onSaved,
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const isEditing = !!initialProperty;

  // Form States
  const [title, setTitle] = useState(initialProperty?.title || '');
  const [slug, setSlug] = useState(initialProperty?.slug || '');
  const [propertyCode, setPropertyCode] = useState(
    initialProperty?.propertyCode || `LUX-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [listingType, setListingType] = useState<'sale' | 'rent'>(
    initialProperty?.listingType || 'sale'
  );
  const [propertyType, setPropertyType] = useState<Property['propertyType']>(
    initialProperty?.propertyType || 'villa'
  );
  const [projectId, setProjectId] = useState(initialProperty?.projectId || '');
  const [description, setDescription] = useState(initialProperty?.description || '');
  const [price, setPrice] = useState(initialProperty?.price || 50000000000);
  const [priceUnit, setPriceUnit] = useState(initialProperty?.priceUnit || 'VND');
  const [area, setArea] = useState(initialProperty?.area || 350);
  const [bedrooms, setBedrooms] = useState(initialProperty?.bedrooms || 4);
  const [bathrooms, setBathrooms] = useState(initialProperty?.bathrooms || 5);
  const [floors, setFloors] = useState(initialProperty?.floors || 3);
  const [direction, setDirection] = useState(initialProperty?.direction || 'Đông Nam');
  const [furnishing, setFurnishing] = useState(
    initialProperty?.furnishing || 'Nội thất nhập khẩu Châu Âu cao cấp'
  );
  const [legal, setLegal] = useState(initialProperty?.legal || 'Sổ hồng lâu dài, pháp lý hoàn chỉnh');

  // Location
  const [province, setProvince] = useState(initialProperty?.location?.province || 'Hồ Chí Minh');
  const [district, setDistrict] = useState(initialProperty?.location?.district || 'Thủ Đức');
  const [ward, setWard] = useState(initialProperty?.location?.ward || 'Thảo Điền');
  const [address, setAddress] = useState(
    initialProperty?.address || 'Khu Biệt Thự Thảo Điền, TP. Thủ Đức, TP. HCM'
  );

  // Media
  const [thumbnail, setThumbnail] = useState(
    initialProperty?.thumbnail ||
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=85'
  );
  const [images, setImages] = useState<string[]>(
    initialProperty?.images && initialProperty.images.length > 0
      ? initialProperty.images
      : [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=85',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=85',
          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1600&auto=format&fit=crop&q=85',
        ]
  );
  const [newImageUrl, setNewImageUrl] = useState('');

  // Amenities
  const [amenities, setAmenities] = useState<string[]>(
    initialProperty?.amenities || [
      'Hồ bơi vô cực',
      'Bến du thuyền riêng',
      'Phòng Cigar & Hầm rượu',
      'Smart Home cao cấp',
      'An ninh 24/7 chuyên biệt',
    ]
  );
  const [customAmenity, setCustomAmenity] = useState('');

  // Marketing flags
  const [isFeatured, setIsFeatured] = useState(initialProperty?.isFeatured || false);
  const [isHot, setIsHot] = useState(initialProperty?.isHot || false);
  const [isNew, setIsNew] = useState(initialProperty?.isNew || false);
  const [status, setStatus] = useState<Property['status']>(initialProperty?.status || 'available');

  const [saving, setSaving] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      setSlug(slugify(val));
    }
  };

  const handleAddImage = () => {
    if (newImageUrl && newImageUrl.startsWith('http')) {
      setImages([...images, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleToggleAmenity = (name: string) => {
    if (amenities.includes(name)) {
      setAmenities(amenities.filter((a) => a !== name));
    } else {
      setAmenities([...amenities, name]);
    }
  };

  const handleAddCustomAmenity = () => {
    if (customAmenity.trim() && !amenities.includes(customAmenity.trim())) {
      setAmenities([...amenities, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      error('Vui lòng nhập tên bất động sản.');
      return;
    }

    setSaving(true);
    try {
      const propertyPayload: Partial<Property> = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        propertyCode: propertyCode.trim().toUpperCase(),
        listingType,
        propertyType,
        projectId: projectId || null,
        description: description.trim(),
        price: Number(price),
        priceUnit,
        area: Number(area),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        floors: Number(floors),
        direction,
        furnishing,
        legal,
        address: address.trim(),
        location: {
          province,
          district,
          ward,
        },
        thumbnail: thumbnail || images[0],
        images,
        amenities,
        isFeatured,
        isHot,
        isNew,
        status,
      };

      if (isEditing && initialProperty) {
        await updatePropertyAdmin(
          initialProperty.id,
          propertyPayload,
          currentUser?.email || 'admin'
        );
        success(`Đã cập nhật BĐS ${propertyCode}.`);
      } else {
        await createPropertyAdmin(propertyPayload, currentUser?.email || 'admin');
        success(`Đã thêm bất động sản mới ${propertyCode}.`);
      }

      onSaved();
    } catch (err: any) {
      error(err.message || 'Lỗi khi lưu bất động sản.');
    } finally {
      setSaving(false);
    }
  };

  const selectedProvinceObj = PROVINCES.find((p) => p.name === province);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-[#161616] border border-white/10 flex items-center justify-center text-[#B8B3A7] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F8F5EE]">
              {isEditing ? `Chỉnh Sửa Bất Động Sản: ${propertyCode}` : 'Thêm Bất Động Sản Mới'}
            </h2>
            <p className="text-xs text-[#B8B3A7]">
              Điền đầy đủ thông tin chuẩn SEO và bộ tiện ích để hiển thị tối ưu trên sàn.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gold-gradient text-black font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 hover:shadow-xl hover:shadow-[#D4AF37]/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Đang lưu...' : 'Lưu Bất Động Sản'}</span>
        </button>
      </div>

      {/* 1. THÔNG TIN CƠ BẢN */}
      <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[24px] p-6 sm:p-8 space-y-5">
        <h3 className="font-serif text-base font-bold text-[#F2D675] border-b border-white/5 pb-2">
          1. Thông Tin Cơ Bản
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Tiêu đề Bất Động Sản *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="VD: Dinh Thự Ven Sông Thảo Điền - Đẳng Cấp Thượng Lưu"
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Mã Bất Động Sản (Property Code) *
            </label>
            <input
              type="text"
              required
              value={propertyCode}
              onChange={(e) => setPropertyCode(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-[#D4AF37] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Đường dẫn Slug (URL)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#B8B3A7] font-mono focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Hình thức giao dịch *
            </label>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value as any)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="sale">Bán Độc Quyền</option>
              <option value="rent">Cho Thuê Thượng Hạng</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Loại hình BĐS *
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as any)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Thuộc Dự Án (Tùy chọn)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">Không thuộc dự án cụ thể</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.province})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Mô tả chi tiết
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả kiến trúc, công năng, hướng nhìn, cảnh quan và phong cách sống thượng lưu..."
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-4 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      {/* 2. GIÁ & THÔNG SỐ KỸ THUẬT */}
      <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[24px] p-6 sm:p-8 space-y-5">
        <h3 className="font-serif text-base font-bold text-[#F2D675] border-b border-white/5 pb-2">
          2. Giá & Thông Số Kỹ Thuật
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Mức giá (VND) *
            </label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-[#F2D675] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Diện tích sử dụng (m²) *
            </label>
            <input
              type="number"
              required
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Số phòng ngủ
            </label>
            <input
              type="number"
              value={bedrooms}
              onChange={(e) => setBedrooms(Number(e.target.value))}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Số phòng tắm / WC
            </label>
            <input
              type="number"
              value={bathrooms}
              onChange={(e) => setBathrooms(Number(e.target.value))}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Số tầng
            </label>
            <input
              type="number"
              value={floors}
              onChange={(e) => setFloors(Number(e.target.value))}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Hướng nhà chính
            </label>
            <input
              type="text"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              placeholder="VD: Đông Nam, Chính Nam..."
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Tình trạng nội thất bàn giao
            </label>
            <input
              type="text"
              value={furnishing}
              onChange={(e) => setFurnishing(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Hồ sơ pháp lý
            </label>
            <input
              type="text"
              value={legal}
              onChange={(e) => setLegal(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      {/* 3. VỊ TRÍ */}
      <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[24px] p-6 sm:p-8 space-y-5">
        <h3 className="font-serif text-base font-bold text-[#F2D675] border-b border-white/5 pb-2">
          3. Vị Trí Địa Lý
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Tỉnh / Thành Phố *
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            >
              {PROVINCES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Quận / Huyện *
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            >
              {selectedProvinceObj?.districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Phường / Xã
            </label>
            <input
              type="text"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="VD: Thảo Điền"
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Địa chỉ hiển thị đầy đủ *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, tên đường, phân khu..."
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      {/* 4. HÌNH ẢNH & MEDIA */}
      <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[24px] p-6 sm:p-8 space-y-5">
        <h3 className="font-serif text-base font-bold text-[#F2D675] border-b border-white/5 pb-2">
          4. Hình Ảnh & Media
        </h3>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
            URL Ảnh đại diện chính (Thumbnail) *
          </label>
          <input
            type="url"
            required
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7]">
            Danh sách ảnh Gallery ({images.length})
          </label>

          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Dán đường dẫn ảnh Unsplash hoặc CDN (https://...)"
              className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-4 py-2 text-xs text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 rounded-xl bg-[#26231c] text-[#F2D675] text-xs font-semibold hover:bg-[#D4AF37] hover:text-black transition-colors"
            >
              Thêm ảnh
            </button>
          </div>

          {/* Images preview grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group border border-white/10">
                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. TIỆN ÍCH */}
      <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[24px] p-6 sm:p-8 space-y-5">
        <h3 className="font-serif text-base font-bold text-[#F2D675] border-b border-white/5 pb-2">
          5. Tiện Ích Đẳng Cấp
        </h3>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {AMENITY_PRESETS.map((preset) => {
              const isSelected = amenities.includes(preset);
              return (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleToggleAmenity(preset)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-gold-gradient text-black font-bold shadow-md'
                      : 'bg-[#161616] text-[#B8B3A7] border border-white/10 hover:border-[#D4AF37]/40'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {preset}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 max-w-md pt-2">
            <input
              type="text"
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              placeholder="Thêm tiện ích khác..."
              className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-4 py-2 text-xs text-[#F8F5EE]"
            />
            <button
              type="button"
              onClick={handleAddCustomAmenity}
              className="px-4 py-2 rounded-xl bg-[#26231c] text-[#F2D675] text-xs font-semibold hover:bg-[#D4AF37] hover:text-black transition-colors"
            >
              Thêm
            </button>
          </div>
        </div>
      </div>

      {/* 6. TRẠNG THÁI & MARKETING */}
      <div className="bg-[#111111] border border-[#D4AF37]/15 rounded-[24px] p-6 sm:p-8 space-y-5">
        <h3 className="font-serif text-base font-bold text-[#F2D675] border-b border-white/5 pb-2">
          6. Trạng Thái & Gắn Nhãn Marketing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Trạng thái niêm yết
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="available">Đang mở bán công khai (Available)</option>
              <option value="reserved">Đã giữ chỗ / Đặt cọc (Reserved)</option>
              <option value="sold">Đã giao dịch thành công (Sold)</option>
              <option value="rented">Đã cho thuê (Rented)</option>
              <option value="hidden">Tạm ẩn trên website (Hidden)</option>
            </select>
          </div>

          <div className="flex flex-col justify-center space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-[#D4AF37]/30 text-[#D4AF37]"
              />
              <span className="text-xs font-semibold text-[#F8F5EE]">
                Gắn nhãn Nổi Bật (Hiển thị tại Banner/Featured Home)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isHot}
                onChange={(e) => setIsHot(e.target.checked)}
                className="w-4 h-4 rounded border-[#D4AF37]/30 text-[#D4AF37]"
              />
              <span className="text-xs font-semibold text-[#EF4444]">
                Gắn nhãn HOT (BĐS Sôi Động / Giới Hạn)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 rounded border-[#D4AF37]/30 text-[#D4AF37]"
              />
              <span className="text-xs font-semibold text-[#22C55E]">
                Gắn nhãn MỚI (Vừa Ra Mắt)
              </span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};
