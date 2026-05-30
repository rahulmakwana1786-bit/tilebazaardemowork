const fs = require('fs');
let code = fs.readFileSync('frontend/app/checkout/page.tsx', 'utf-8');
code = code.replace(/className=\"w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-\[\#4a2c2a\]\"/g, 'className="w-full border border-gray-200 px-4 py-3 text-base text-gray-900 font-medium focus:outline-none focus:border-[#4a2c2a]"');

code = code.replace(/className=\{\`w-full border px-4 py-3 text-sm focus:outline-none focus:border-\[\#4a2c2a\] \$\{errors\.address \? \"border-red-500\" : \"border-gray-200\"\}\`\}/g, 'className={`w-full border px-4 py-3 text-base text-gray-900 font-medium focus:outline-none focus:border-[#4a2c2a] ${errors.address ? "border-red-500" : "border-gray-200"}`}');

code = code.replace(/className=\{\`w-full border px-4 py-3 text-sm uppercase focus:outline-none focus:border-\[\#4a2c2a\] \$\{errors\.postcode \? \"border-red-500\" : \"border-gray-200\"\}\`\}/g, 'className={`w-full border px-4 py-3 text-base text-gray-900 font-medium uppercase focus:outline-none focus:border-[#4a2c2a] ${errors.postcode ? "border-red-500" : "border-gray-200"}`}');

code = code.replace(/className=\"w-full pl-10 pr-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-\[\#4a2c2a\]\"/g, 'className="w-full pl-10 pr-4 py-3 border border-gray-200 text-base text-gray-900 font-medium focus:outline-none focus:border-[#4a2c2a]"');

fs.writeFileSync('frontend/app/checkout/page.tsx', code);
console.log('done');
