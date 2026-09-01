import React, { useState } from 'react';
import { Save, Globe, Layout, Phone, Share2, BarChart2 } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { SiteSettings } from '../../types';
import { updateSiteSettingsAdmin } from '../../services/adminService';

export const AdminSiteSettings: React.FC = () => {
  const { siteSettings, refreshSettings } = useSite();
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [brandName, setBrandName] = useState(siteSettings.brandName);
  const [slogan, setSlogan] = useState(siteSettings.slogan);
  const [logoText, setLogoText] = useState(siteSettings.logoText);
  const [hotline, setHotline] = useState(siteSettings.hotline);
  const [email, setEmail] = useState(siteSettings.email);
  const [address, setAddress] = useState(siteSettings.address);

  // Hero
  const [eyebrow, setEyebrow] = useState(siteSettings.hero.eyebrow);
  const [heading, setHeading] = useState(siteSettings.hero.heading);
  const [description, setDescription] = useState(siteSettings.hero.description);
  const [backgroundImage, setBackgroundImage] = useState(siteSettings.hero.backgroundImage);
  const [primaryCTA, setPrimaryCTA] = useState(siteSettings.hero.primaryCTA);
  const [secondaryCTA, setSecondaryCTA] = useState(siteSettings.hero.secondaryCTA);

  // Stats
  const [statProps, setStatProps] = useState(siteSettings.stats.properties);
  const [statCust, setStatCust] = useState(siteSettings.stats.customers);
  const [statProj, setStatProj] = useState(siteSettings.stats.projects);
  const [statYears, setStatYears] = useState(siteSettings.stats.yearsExperience);

  // Social
  const [facebook, setFacebook] = useState(siteSettings.socialLinks?.facebook || siteSettings.facebookUrl || '');
  const [youtube, setYoutube] = useState(siteSettings.socialLinks?.youtube || siteSettings.youtubeUrl || '');
  const [zalo, setZalo] = useState(siteSettings.socialLinks?.zalo || siteSettings.zaloUrl || '');
  const [instagram, setInstagram] = useState(siteSettings.socialLinks?.instagram || '');

  // SEO & Analytics
  const [defaultTitle, setDefaultTitle] = useState(siteSettings.seo?.defaultTitle || '');
  const [defaultDescription, setDefaultDescription] = useState(siteSettings.seo?.defaultDescription || '');
  const [defaultOgImage, setDefaultOgImage] = useState(siteSettings.seo?.defaultOgImage || '');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(siteSettings.analytics?.googleAnalyticsId || '');

  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    try {
      const payload: SiteSettings = {
        ...siteSettings,
        brandName: brandName.trim(),
        slogan: slogan.trim(),
        logoText: logoText.trim(),
        hotline: hotline.trim(),
        email: email.trim(),
        address: address.trim(),
        hero: {
          eyebrow: eyebrow.trim(),
          heading: heading.trim(),
          description: description.trim(),
          backgroundImage: backgroundImage.trim(),
          primaryCTA: primaryCTA.trim(),
          secondaryCTA: secondaryCTA.trim(),
        },
        stats: {
          properties: Number(statProps),
          customers: Number(statCust),
          projects: Number(statProj),
          yearsExperience: Number(statYears),
        },
        socialLinks: {
          facebook: facebook.trim(),
          youtube: youtube.trim(),
          zalo: zalo.trim(),
          instagram: instagram.trim(),
        },
        seo: {
          defaultTitle: defaultTitle.trim() || undefined,
          defaultDescription: defaultDescription.trim() || undefined,
          defaultOgImage: defaultOgImage.trim() || undefined,
        },
        analytics: {
          googleAnalyticsId: googleAnalyticsId.trim() || undefined,
        },
      };

      await updateSiteSettingsAdmin(payload, currentUser.email || 'admin');
      await refreshSettings();
      success('Đã lưu toàn bộ cấu hình website thành công.');
    } catch (err: any) {
      error('Lỗi khi lưu cấu hình website.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#F8F5EE]">
            Cấu Hình Website & Thương Hiệu
          </h2>
          <p className="text-xs text-[#B8B3A7] mt-0.5">
            Thay đổi slogan, hero banner, số liệu thống kê, hotline và thông tin chân trang theo thời gian thực.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gold-gradient text-black font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 hover:shadow-xl hover:shadow-[#D4AF37]/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Đang lưu...' : 'Lưu Cấu Hình Web'}</span>
        </button>
      </div>

      {/* 1. BRAND & CONTACT */}
      <div className="bg-[#111111] border border-[#D4AF37]/18 rounded-[24px] p-6 sm:p-8 space-y-5 shadow-xl">
        <h3 className="font-serif text-base font-bold text-[#F2D675] border-b border-white/5 pb-2 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span>1. Nhận Diện Thương Hiệu & Liên Hệ</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Tên Thương Hiệu
            </label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Khẩu Hiệu / Slogan
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Hotline Tư Vấn VIP *
            </label>
            <input
              type="text"
              required
              value={hotline}
              onChange={(e) => setHotline(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F2D675] font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Email Hỗ Trợ Khách Hàng *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Địa Chỉ Trụ Sở Chính
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <div className="bg-[#111111] border border-[#D4AF37]/18 rounded-[24px] p-6 sm:p-8 space-y-5 shadow-xl">
        <h3 className="font-serif text-base font-bold text-[#F2D675] border-b border-white/5 pb-2 flex items-center gap-2">
          <Layout className="w-4 h-4" />
          <span>2. Tiêu Đề & Hình Ảnh Hero Trang Chủ</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Eyebrow Tag (Nhỏ trên tiêu đề)
            </label>
            <input
              type="text"
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Nút CTA Chính
            </label>
            <input
              type="text"
              value={primaryCTA}
              onChange={(e) => setPrimaryCTA(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Tiêu Đề Hero Chính (Dùng xuống dòng để ngắt)
            </label>
            <textarea
              rows={2}
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-sm font-serif font-bold text-[#F8F5EE]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Mô Tả Ngắn Dưới Tiêu Đề
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-sm text-[#F8F5EE]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              URL Ảnh Nền Hero (Background Image)
            </label>
            <input
              type="url"
              value={backgroundImage}
              onChange={(e) => setBackgroundImage(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>
        </div>
      </div>

      {/* 3. STATS SECTION */}
      <div className="bg-[#111111] border border-[#D4AF37]/18 rounded-[24px] p-6 sm:p-8 space-y-5 shadow-xl">
        <h3 className="font-serif text-base font-bold text-[#F2D675] border-b border-white/5 pb-2 flex items-center gap-2">
          <BarChart2 className="w-4 h-4" />
          <span>3. Thống Kê Nổi Bật (Statistics Counter)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              BĐS Tuyển Chọn
            </label>
            <input
              type="number"
              value={statProps}
              onChange={(e) => setStatProps(Number(e.target.value))}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Khách Hàng VIP
            </label>
            <input
              type="number"
              value={statCust}
              onChange={(e) => setStatCust(Number(e.target.value))}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Dự Án Đẳng Cấp
            </label>
            <input
              type="number"
              value={statProj}
              onChange={(e) => setStatProj(Number(e.target.value))}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Năm Kinh Nghiệm
            </label>
            <input
              type="number"
              value={statYears}
              onChange={(e) => setStatYears(Number(e.target.value))}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>
        </div>
      </div>

      {/* 4. SOCIAL LINKS */}
      <div className="bg-[#111111] border border-[#D4AF37]/18 rounded-[24px] p-6 sm:p-8 space-y-5 shadow-xl">
        <h3 className="font-serif text-base font-bold text-[#F2D675] border-b border-white/5 pb-2 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          <span>4. Mạng Xã Hội</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Facebook URL
            </label>
            <input
              type="url"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              YouTube Channel
            </label>
            <input
              type="url"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Zalo Official Link / SĐT
            </label>
            <input
              type="text"
              value={zalo}
              onChange={(e) => setZalo(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Instagram URL
            </label>
            <input
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
          </div>
        </div>
      </div>

      {/* 5. SEO & GOOGLE ANALYTICS */}
      <div className="bg-[#111111] border border-[#D4AF37]/18 rounded-[24px] p-6 sm:p-8 space-y-5 shadow-xl">
        <h3 className="font-serif text-base font-bold text-[#F2D675] border-b border-white/5 pb-2 flex items-center gap-2">
          <BarChart2 className="w-4 h-4" />
          <span>5. Tối Ưu SEO & Đo Lường Google Analytics 4</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Tiêu Đề Mặc Định (SEO Default Title)
            </label>
            <input
              type="text"
              placeholder="AURA LUXURY | Bất Động Sản Đẳng Cấp & Thượng Lưu"
              value={defaultTitle}
              onChange={(e) => setDefaultTitle(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
            <p className="text-[11px] text-[#77736B] mt-1">
              Hiển thị trên kết quả tìm kiếm Google khi trang không có tiêu đề riêng.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
              Mô Tả Meta Mặc Định (SEO Default Description)
            </label>
            <textarea
              rows={3}
              placeholder="Khám phá bộ sưu tập bất động sản thượng lưu, biệt thự, penthouse đắt giá hàng đầu..."
              value={defaultDescription}
              onChange={(e) => setDefaultDescription(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
            />
            <p className="text-[11px] text-[#77736B] mt-1">
              Độ dài khuyến nghị 150-160 ký tự để hiển thị trọn vẹn trên Google SERP.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
                Ảnh Đại Diện Chia Sẻ Mặc Định (Default OG Image URL)
              </label>
              <input
                type="url"
                placeholder="https://.../og-banner.jpg"
                value={defaultOgImage}
                onChange={(e) => setDefaultOgImage(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B3A7] mb-1.5">
                Mã Đo Lường Google Analytics 4 (Measurement ID)
              </label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8F5EE] font-mono"
              />
              <p className="text-[11px] text-[#77736B] mt-1">
                Nhập mã định dạng G-XXXXXX để kích hoạt theo dõi lưu lượng và hành vi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
