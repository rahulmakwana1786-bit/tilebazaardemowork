const fs = require('fs');
let text = fs.readFileSync('frontend/app/products/[slug]/page.tsx', 'utf-8');

// 1. Add AdhesiveTabs component
const adhesiveTabsCode = fs.readFileSync('adhesivetabs.txt', 'utf-8');
text = text.replace('export default function ProductDetailPage', adhesiveTabsCode + '\n\nexport default function ProductDetailPage');

// 2. Add isPoster variable
text = text.replace(
  'const displayName = formatFileName(fileNameOnly);',
  'const displayName = formatFileName(fileNameOnly);\n  const isPoster = fileNameOnly.toUpperCase().includes("POSTER");'
);

// 3. Add useCart import
text = text.replace(
  'import { RootState } from "@/store/store";',
  'import { RootState } from "@/store/store";\nimport { useCart } from "@/context/CartContext";'
);

// 4. Add setCartOpen
text = text.replace(
  '// CartContext doesn\'t expose setCartOpen in this project',
  'const { setCartOpen } = useCart();'
);

// 5. Update handleAddToCart to open cart
text = text.replace(/setTimeout\(\(\) => setIsSuccess\(false\), 2500\);/g, 'setCartOpen(true);\n      setTimeout(() => setIsSuccess(false), 2500);');

// 6. Update Price block
const priceBlockRegex = /<div className="mb-8">\s*<p className="text-\[9px\] font-black uppercase tracking-\[0\.3em\] text-gray-400 mb-2\">\s*Price\s*<\/p>[\s\S]*?<\/div>\s*<\/div>/;
const priceReplacement = `{isPoster ? (
              <div className="mb-8">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                  Price
                </p>
                <p className="text-3xl font-bold text-[#4a2c2a]">POA</p>
                <p className="text-xs text-gray-400 mt-1">
                  Please enquire for pricing
                </p>
              </div>
            ) : (
              <div className="mb-8">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                  Price
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-[#4a2c2a]">
                    £{details.price.toFixed(2)}
                  </span>
                  {!details.isAccessory && (
                    <span className="text-xl line-through text-gray-300">
                      £{(details.price + 5).toFixed(2)}
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400 font-medium">
                    / {details.unit}
                  </span>
                </div>
                {!details.isAccessory && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Save £{(5).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}`;
text = text.replace(priceBlockRegex, priceReplacement);

// 7. Replace Add to Cart button
const btnRegex = /<button\s+onClick=\{handleAddToCart\}[\s\S]*?<\/button>/;
const btnReplacement = `{isPoster ? (
                <button
                  disabled
                  className="w-full py-5 bg-gray-100 text-gray-400 text-[11px] font-black uppercase tracking-[0.25em] rounded-sm cursor-not-allowed"
                >
                  Inquire for Price
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={\`w-full py-5 text-[11px] font-black uppercase tracking-[0.25em] rounded-sm border-2 transition-all duration-300 flex items-center justify-center gap-3
                    \${
                      isSuccess
                        ? "bg-green-600 border-green-600 text-white shadow-green-200"
                        : "bg-white border-[#4a2c2a] text-[#4a2c2a] hover:bg-[#4a2c2a] hover:text-white active:scale-[0.99]"
                    } disabled:opacity-70\`}
                >
                  {isAdding ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Adding...
                    </>
                  ) : isSuccess ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
              )}`;
text = text.replace(btnRegex, btnReplacement);

fs.writeFileSync('frontend/app/products/[slug]/page.tsx', text);
console.log('Patch completed.');
