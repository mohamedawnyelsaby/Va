#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# PATH: fix-fonts.sh  (ضعه في root المشروع وشغّله)
# Va Travel — Font Size Auto-Fix Script
# يرفع كل font size أقل من 0.65rem إلى الحد الأدنى المقبول
# ═══════════════════════════════════════════════════════════════

set -e
echo "🔍 Va Travel Font Size Fixer"
echo "══════════════════════════════"

# ── الملفات المستهدفة ──────────────────────────────────────────
FILES=(
  "src/app/[locale]/about/page.tsx"
  "src/app/[locale]/attractions/page.tsx"
  "src/app/[locale]/attractions/[id]/page.tsx"
  "src/app/[locale]/bookings/page.tsx"
  "src/app/[locale]/booking/page.tsx"
  "src/app/[locale]/cities/page.tsx"
  "src/app/[locale]/dashboard/page.tsx"
  "src/app/[locale]/hotels/page.tsx"
  "src/app/[locale]/hotels/[id]/page.tsx"
  "src/app/[locale]/restaurants/page.tsx"
  "src/app/[locale]/restaurants/[id]/page.tsx"
  "src/app/[locale]/search/page.tsx"
  "src/app/[locale]/wallet/page.tsx"
  "src/app/components/PaymentFlow.tsx"
  "src/components/layout/footer.tsx"
  "src/components/layout/navbar.tsx"
  "src/components/sections/features.tsx"
  "src/components/sections/how-it-works.tsx"
  "src/components/sections/pi-integration.tsx"
  "src/components/sections/popular-destinations.tsx"
  "src/components/sections/testimonials.tsx"
)

FIXED=0
SKIPPED=0

for FILE in "${FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "  ⚠️  Not found: $FILE"
    ((SKIPPED++))
    continue
  fi

  # ── أضف import إذا لم يكن موجوداً ──
  if ! grep -q "from '@/lib/tokens'" "$FILE"; then
    # أضف بعد آخر import موجود
    LAST_IMPORT=$(grep -n "^import" "$FILE" | tail -1 | cut -d: -f1)
    if [ -n "$LAST_IMPORT" ]; then
      sed -i "${LAST_IMPORT}a import { VG } from '@/lib/tokens';" "$FILE"
    else
      sed -i "1s/^/import { VG } from '@\/lib\/tokens';\n/" "$FILE"
    fi
  fi

  # ── استبدال أحجام الخط ──────────────────────────────────────
  # قاعدة: أي قيمة أقل من 0.6rem تُرفع لـ VG.font.micro أو VG.font.tiny

  sed -i \
    -e "s/fontSize: '0\.38rem'/fontSize: VG.font.micro/g" \
    -e "s/fontSize: '0\.40rem'/fontSize: VG.font.micro/g" \
    -e "s/fontSize: '0\.42rem'/fontSize: VG.font.micro/g" \
    -e "s/fontSize: '0\.44rem'/fontSize: VG.font.micro/g" \
    -e "s/fontSize: '0\.46rem'/fontSize: VG.font.micro/g" \
    -e "s/fontSize: '0\.48rem'/fontSize: VG.font.micro/g" \
    -e "s/fontSize: '0\.50rem'/fontSize: VG.font.tiny/g" \
    -e "s/fontSize: '0\.5rem'/fontSize: VG.font.tiny/g" \
    -e "s/fontSize: '0\.52rem'/fontSize: VG.font.tiny/g" \
    -e "s/fontSize: '0\.54rem'/fontSize: VG.font.tiny/g" \
    -e "s/fontSize: '0\.56rem'/fontSize: VG.font.tiny/g" \
    -e "s/fontSize: '0\.58rem'/fontSize: VG.font.tiny/g" \
    "$FILE"

  # ── استبدال letter-spacing القديمة ──────────────────────────
  sed -i \
    -e "s/letterSpacing: '0\.12em'/letterSpacing: VG.tracking.tight/g" \
    -e "s/letterSpacing: '0\.15em'/letterSpacing: VG.tracking.tight/g" \
    -e "s/letterSpacing: '0\.18em'/letterSpacing: VG.tracking.normal/g" \
    -e "s/letterSpacing: '0\.20em'/letterSpacing: VG.tracking.normal/g" \
    -e "s/letterSpacing: '0\.22em'/letterSpacing: VG.tracking.normal/g" \
    -e "s/letterSpacing: '0\.25em'/letterSpacing: VG.tracking.wide/g" \
    -e "s/letterSpacing: '0\.28em'/letterSpacing: VG.tracking.wide/g" \
    -e "s/letterSpacing: '0\.30em'/letterSpacing: VG.tracking.wide/g" \
    -e "s/letterSpacing: '0\.32em'/letterSpacing: VG.tracking.wide/g" \
    "$FILE"

  echo "  ✅ Fixed: $FILE"
  ((FIXED++))
done

echo ""
echo "══════════════════════════════"
echo "✅ Fixed:   $FIXED files"
echo "⚠️  Skipped: $SKIPPED files"
echo ""

# ── تحقق من أنه لم يتبق أي قيمة صغيرة ─────────────────────
echo "🔍 Checking for remaining small font sizes..."
REMAINING=$(grep -rn "fontSize: '0\.[0-5][0-8]rem'" src/app src/components 2>/dev/null | grep -v ".bak" | grep -v "node_modules" | wc -l)

if [ "$REMAINING" -gt "0" ]; then
  echo "⚠️  Found $REMAINING remaining small font sizes:"
  grep -rn "fontSize: '0\.[0-5][0-8]rem'" src/app src/components 2>/dev/null | grep -v ".bak" | grep -v "node_modules" | head -20
else
  echo "✅ No small font sizes remaining!"
fi

echo ""
echo "🎉 Font fix complete!"
echo ""
echo "Next steps:"
echo "  1. Run: npm run build  (check for TypeScript errors)"
echo "  2. Test light mode at /en/hotels and /en/dashboard"
echo "  3. Test mobile at 375px width"
