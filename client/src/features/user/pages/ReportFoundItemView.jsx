import React, { useState, useEffect } from 'react';
import userApi from '../services/userApi';

export const ReportFoundItemView = ({ onNavigate, onReportSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Campus State');
  const [itemDate, setItemDate] = useState(new Date().toISOString().slice(0, 10));
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    userApi.getCategories().then((res) => {
      if (res.data?.categories) {
        setCategories(res.data.categories);
      }
    }).catch(console.error);
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      setError('You can upload a maximum of 5 images.');
      return;
    }

    const validFiles = [];
    const validPreviews = [];

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 5 MB limit.`);
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    setImages((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...validPreviews]);
    setError(null);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      setError('Item title must be at least 3 characters.');
      return;
    }
    if (!categoryId) {
      setError('Please choose an item category.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }
    if (!address.trim() || !city.trim()) {
      setError('Please provide found address and campus zone.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('type', 'FOUND');
      formData.append('categoryId', categoryId);
      formData.append(
        'description',
        brand.trim() ? `[Brand: ${brand.trim()}] ${description.trim()}` : description.trim()
      );
      formData.append('itemDate', new Date(itemDate).toISOString());
      formData.append(
        'location',
        JSON.stringify({
          address: address.trim(),
          city: city.trim(),
          state: state.trim() || 'Campus State'
        })
      );

      images.forEach((file) => {
        formData.append('images', file);
      });

      const res = await userApi.createItem(formData);
      setSuccess(true);
      if (onReportSuccess) {
        onReportSuccess(res.data?.item);
      }
      setTimeout(() => {
        onNavigate('my-reports');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit found report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-space-2xl">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant mb-space-md">
        <button onClick={() => onNavigate('user-home-overview')} className="hover:text-primary transition-colors cursor-pointer">
          Dashboard
        </button>
        <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
        <span className="text-on-surface font-semibold">Report Found Item</span>
      </nav>

      {/* Header Banner Section */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-lg mb-space-xl shadow-sm border border-outline-variant/30">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm mb-space-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">pan_tool</span>
              Good Samaritan Intake Desk
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Report a Found Item</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Log details of items discovered across campus, classrooms, dining halls, or transit to facilitate swift custody repatriation.
            </p>
          </div>
          <div className="flex items-center gap-space-sm self-start md:self-auto bg-surface-container-lowest px-space-md py-2.5 rounded-lg shadow-sm border border-outline-variant/30">
            <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant leading-none">Custody Receipt</p>
              <p className="font-label-md text-label-md text-on-surface font-semibold mt-0.5">Chain of Custody Logged</p>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-label-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-600 text-[24px]">task_alt</span>
          <div>
            <strong>Found Item Successfully Logged!</strong> Record registered with status{' '}
            <span className="font-semibold text-amber-700">PENDING</span> review. Redirecting to My Reports...
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 font-label-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-rose-600 text-[24px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Form Body */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* LEFT COLUMN: Metadata (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Card 1: Found Item Identification */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-space-sm">
                <span className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center font-label-md text-label-md text-secondary font-bold">
                  1
                </span>
                <h2 className="font-title-md text-title-md text-on-surface">Item Identification</h2>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Fields with * are required</span>
            </div>

            {/* Item Title */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="foundTitle">
                Item Title <span className="text-error">*</span>
              </label>
              <input
                id="foundTitle"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sony WH-1000XM5 Silver Noise-Canceling Headphones"
                type="text"
                className="h-10 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md shadow-xs placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all border border-outline-variant/40"
              />
            </div>

            {/* Category & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="foundCategory">
                  Item Category <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="foundCategory"
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-10 pl-3.5 pr-9 appearance-none rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md shadow-xs focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all border border-outline-variant/40 cursor-pointer"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
                    keyboard_arrow_down
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="foundBrand">
                  Brand / Make
                </label>
                <input
                  id="foundBrand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Sony, Apple, Nike, Casio"
                  type="text"
                  className="h-10 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md shadow-xs placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all border border-outline-variant/40"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="foundDesc">
                Visual Description & Condition <span className="text-error">*</span>
              </label>
              <textarea
                id="foundDesc"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Discovered inside gray protective case. Mild scuffs on headband. Includes charging cable in pocket."
                className="p-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md shadow-xs placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all resize-none border border-outline-variant/40"
              />
            </div>
          </div>

          {/* Card 2: Discovery Location & Handover */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-space-sm">
                <span className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center font-label-md text-label-md text-secondary font-bold">
                  2
                </span>
                <h2 className="font-title-md text-title-md text-on-surface">Discovery Location & Date</h2>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Intake Registry</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="foundAddress">
                Specific Location Where Found <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
                  location_on
                </span>
                <input
                  id="foundAddress"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., Engineering Hall, Lab 302 Desk 4"
                  type="text"
                  className="w-full h-10 pl-10 pr-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md shadow-xs placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all border border-outline-variant/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="foundCity">
                  Campus Zone / Hub <span className="text-error">*</span>
                </label>
                <input
                  id="foundCity"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Engineering Hall, Central Campus"
                  type="text"
                  className="h-10 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md shadow-xs placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all border border-outline-variant/40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="foundDate">
                  Date Discovered <span className="text-error">*</span>
                </label>
                <input
                  id="foundDate"
                  required
                  type="date"
                  value={itemDate}
                  onChange={(e) => setItemDate(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md shadow-xs focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all border border-outline-variant/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Evidence & Handover Guidance (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Card 3: Photos */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-space-sm">
                <span className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center font-label-md text-label-md text-secondary font-bold">
                  3
                </span>
                <h2 className="font-title-md text-title-md text-on-surface">Photographs of Found Item</h2>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Max 5 photos</span>
            </div>

            <div className="relative p-6 rounded-xl border-2 border-dashed border-outline-variant/80 bg-surface-container-low/60 hover:bg-surface-container-low flex flex-col items-center justify-center text-center transition-colors cursor-pointer group">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px]">add_a_photo</span>
              </div>
              <p className="font-label-md text-label-md font-semibold text-on-surface">
                Upload clear photos of the item
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Helps verified owners recognize their belongings
              </p>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative h-20 rounded-lg overflow-hidden border border-outline-variant">
                    <img src={src} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4: Custody Transfer Guidance */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm border border-outline-variant/30">
            <div className="flex items-center gap-2 text-secondary font-semibold font-title-md">
              <span className="material-symbols-outlined text-[20px]">handshake</span>
              <span>Physical Handover Recommendation</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              We recommend dropping off valuable found items (electronics, wallets, keys, jewelry) at any of the 4 campus security intake desks so property remains safely in custody.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-space-lg rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                <span>Registering Found Property...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">pan_tool</span>
                <span>Submit Found Item Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportFoundItemView;
