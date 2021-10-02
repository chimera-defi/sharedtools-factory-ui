const fs = require('fs');
let list, names, imports, exportStr, result;

list = fs.readdirSync('utils/ABI');
names = list.map(file => file.split('.')[0]);

imports = list.map((file, i) => `import ${names[i]} from 'utils/ABI/${file}';`);
exportStr = `export {${names.join(', ')}};`;

result = imports.join('\n');
result += '\n' + exportStr;

fs.writeFileSync('utils/ABIs.js', result, 'utf8');
