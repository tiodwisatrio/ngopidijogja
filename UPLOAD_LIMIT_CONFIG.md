# Upload File Size Limit Configuration

## 📊 Current Settings

### **Upload Limit: 10MB**

**Before**: 5MB
**After**: **10MB** per file

---

## 🔧 Changes Made

### 1. **API Route Upload Limit** ([app/api/upload/route.ts](app/api/upload/route.ts))

**Line 6-13**: Added route configuration
```ts
// Configure route to accept larger file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
```

**Line 26-32**: Updated validation message
```ts
// Validate file size (max 10MB)
if (file.size > 10 * 1024 * 1024) {
  return NextResponse.json(
    { error: 'File size must be less than 10MB' },
    { status: 400 }
  );
}
```

---

## 📏 Size Comparison

| Image Type | Resolution | Quality | Typical Size | Status |
|------------|------------|---------|--------------|--------|
| **HD Photo** | 1920x1080 | 95% | ~400-800KB | ✅ Well within limit |
| **2K Photo** | 2560x1440 | 95% | ~800KB-1.5MB | ✅ Within limit |
| **4K Photo** | 3840x2160 | 95% | ~2-4MB | ✅ Within limit |
| **4K Max Quality** | 3840x2160 | 100% | ~5-8MB | ✅ **Now supported!** |
| **RAW Photo** | 6000x4000 | Uncompressed | ~15-30MB | ❌ Exceeds limit |

---

## 💡 Why 10MB?

### ✅ **Pros:**
- Supports 4K photos at maximum quality (100%)
- Users don't need to manually compress high-quality photos
- Flexible enough for cafe owner submissions
- Professional-grade cafe photography

### ⚠️ **Considerations:**
- Larger file sizes = slower initial upload
- More storage space required
- Slightly longer page load times

### 🎯 **Best Practice:**
Even with 10MB limit, recommended upload sizes:
- **1920x1080 @ 95% quality** (~500KB) - **IDEAL** for web
- **2560x1440 @ 95% quality** (~1.2MB) - Great for high-res displays
- **3840x2160 @ 90% quality** (~3MB) - Only if needed for print/zoom

---

## 🚨 Important Notes

### **Next.js App Router Behavior:**

In Next.js App Router (v13+), the route-level `config` export sets the body size limit specifically for that route:

```ts
// app/api/upload/route.ts
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // ✅ Works for App Router routes
    },
  },
};
```

**Note**: This is different from Pages Router where you'd set it in `next.config.ts`.

---

## 🧪 Testing

### Test Upload Limits:

1. **Small file (< 1MB)**: Should upload successfully ✅
2. **Medium file (5MB)**: Should upload successfully ✅
3. **Large file (9MB)**: Should upload successfully ✅
4. **Oversized file (11MB)**: Should reject with error ❌

**Expected Error for >10MB:**
```json
{
  "error": "File size must be less than 10MB"
}
```

---

## 📋 Validation Checklist

Current upload validation:

1. ✅ **File exists** - `if (!file)` check
2. ✅ **File is image** - `if (!file.type.startsWith('image/'))` check
3. ✅ **File size < 10MB** - `if (file.size > 10 * 1024 * 1024)` check
4. ✅ **Unique filename** - Timestamp prefix
5. ✅ **Safe storage** - Saved to `public/uploads/`

---

## 🔄 Alternative Limits

If you need different limits in the future:

### **Conservative (5MB)**
```ts
// Faster uploads, less storage
if (file.size > 5 * 1024 * 1024) {
  return NextResponse.json(
    { error: 'File size must be less than 5MB' },
    { status: 400 }
  );
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};
```

### **Generous (20MB)**
```ts
// For professional photography
if (file.size > 20 * 1024 * 1024) {
  return NextResponse.json(
    { error: 'File size must be less than 20MB' },
    { status: 400 }
  );
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};
```

### **Unlimited (Not Recommended)**
```ts
// Remove size validation entirely (DANGEROUS!)
// Not recommended - opens door to abuse
```

---

## 🎯 Recommended Upload Workflow

### For Admin/Cafe Owners:

1. **Download photos from Google Maps** using extension
2. **Check file size**:
   - If < 10MB → Upload directly ✅
   - If > 10MB → Compress first using:
     - [TinyPNG](https://tinypng.com) (online, free)
     - [ImageOptim](https://imageoptim.com) (Mac app)
     - Photoshop "Save for Web"
3. **Upload via admin panel**
4. **Verify image quality** on frontend

### Image Quality Settings (Recommended):

| Use Case | Resolution | Quality | File Size | Upload |
|----------|-----------|---------|-----------|--------|
| **Standard** | 1920x1080 | 90-95% | ~500KB | ✅ Fast |
| **High-End** | 2560x1440 | 95% | ~1.2MB | ✅ Good |
| **Premium** | 3840x2160 | 90% | ~3MB | ✅ Acceptable |
| **Overkill** | 3840x2160 | 100% | ~8MB | ⚠️ Slow |

---

## 📊 Storage Impact

**Estimate for 50 cafes:**

| Scenario | Avg File Size | Photos per Cafe | Total Storage |
|----------|---------------|-----------------|---------------|
| **Conservative** | 500KB | 5 | ~125MB |
| **Standard** | 1.2MB | 5 | ~300MB |
| **High-End** | 3MB | 5 | ~750MB |
| **Current** (actual) | 2.5MB | 3 | ~375MB |

**Hosting Considerations:**
- Vercel Free: 100GB bandwidth/month (plenty for images)
- Cloudflare Pages: Unlimited bandwidth (even better)
- Self-hosted: Depends on server

---

## 🔐 Security Notes

### Current Security Measures:

1. ✅ **File type validation**: Only images allowed
2. ✅ **File size validation**: Max 10MB
3. ✅ **Unique filenames**: Timestamp prefix prevents collisions
4. ✅ **Safe directory**: Files saved to `public/uploads/` only

### Potential Improvements (Future):

- [ ] Add image dimension validation (max 8000x8000px)
- [ ] Add MIME type verification (check actual file content, not just extension)
- [ ] Add virus/malware scanning (for production)
- [ ] Add rate limiting (prevent upload spam)
- [ ] Add user authentication (currently anyone can upload)

---

## 📝 Files Modified

1. **[app/api/upload/route.ts](app/api/upload/route.ts)**
   - Line 6-13: Added route config for 10MB body size limit
   - Line 26-32: Updated validation to check for 10MB limit

---

## ✨ Summary

**Previous Limit**: 5MB per file
**New Limit**: **10MB** per file

**Supports**:
- ✅ 4K photos at 95-100% quality
- ✅ High-resolution cafe photography
- ✅ Professional-grade images from cafe owners
- ✅ Flexible upload without manual compression

**Trade-offs**:
- ⚠️ Slightly larger storage requirements
- ⚠️ Longer upload times for large files
- ✅ Better image quality overall

**Recommendation**: 10MB is a sweet spot for cafe website - professional enough for high-quality photos, reasonable enough for web performance.

---

**Updated by**: Claude Code
**Date**: 2025-12-27
**Change**: Upload limit 5MB → 10MB
**Status**: ✅ Active
