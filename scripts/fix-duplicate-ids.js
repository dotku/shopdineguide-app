const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../assets/data/businesses.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('🔧 Fixing duplicate IDs...');
console.log(`Total businesses: ${data.businesses.length}`);

// 查找所有重复的 ID
const idCounts = {};
data.businesses.forEach(b => {
  idCounts[b.id] = (idCounts[b.id] || 0) + 1;
});

const duplicates = Object.entries(idCounts)
  .filter(([id, count]) => count > 1)
  .map(([id]) => parseInt(id));

console.log(`Found ${duplicates.length} IDs with duplicates`);
console.log('Duplicate IDs:', duplicates);

// 重新分配 ID（一次性，永久的）
let maxId = Math.max(...data.businesses.map(b => b.id));
const seenIds = new Set();
let reassigned = 0;

const fixedBusinesses = data.businesses.map((biz, index) => {
  if (seenIds.has(biz.id)) {
    // 这是重复的，分配新 ID
    const oldId = biz.id;
    maxId++;
    reassigned++;
    
    console.log(`  [${reassigned}] ${biz.name}: ${oldId} → ${maxId}`);
    
    seenIds.add(maxId);
    return { ...biz, id: maxId };
  }
  
  seenIds.add(biz.id);
  return biz;
});

// 备份原文件
const backupPath = path.join(__dirname, '../assets/data/businesses.backup.json');
fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
console.log(`\n💾 Backup saved to: ${backupPath}`);

// 保存修复后的数据
data.businesses = fixedBusinesses;
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`\n✅ Fixed ${reassigned} duplicate IDs`);
console.log(`✅ All ${fixedBusinesses.length} businesses now have unique IDs`);
console.log(`✅ ID range: 1 - ${maxId}`);
console.log(`\nSaved to: ${dataPath}`);