const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Production VSIX Builder for AgentCouncil v3.0.0
 * Zero-dependency, cross-platform packager
 */

const extDir = path.join(__dirname, 'extention');
const packageJson = JSON.parse(fs.readFileSync(path.join(extDir, 'package.json'), 'utf8'));
const vsixName = `${packageJson.name}-${packageJson.version}.vsix`;
const outPath = path.join(extDir, vsixName);

console.log(`\n📦 Building ${packageJson.displayName}`);
console.log(`   Version : ${packageJson.version}`);
console.log(`   Output  : ${vsixName}\n`);

// ── Pre-build validation ──
const jsCode = fs.readFileSync(path.join(extDir, 'extension.js'), 'utf8');
const requiredFields = ['name','version','publisher','displayName','description'];
const missing = requiredFields.filter(f => !packageJson[f]);
if (missing.length > 0) {
  console.error('❌ Missing required fields in package.json:', missing.join(', '));
  process.exit(1);
}
console.log('✅ Pre-build validation passed');

// ── Stage directory ──
const stageDir = path.join(extDir, '.staging');
const extStage = path.join(stageDir, 'extension');

if (fs.existsSync(stageDir)) fs.rmSync(stageDir, { recursive: true, force: true });
fs.mkdirSync(extStage, { recursive: true });
if (fs.existsSync(path.join(extDir, 'media'))) {
  fs.mkdirSync(path.join(extStage, 'media'), { recursive: true });
}

// ── Files to include ──
const filesToCopy = [
  'package.json', 'extension.js', 'ecc-engine.js',
  'ai-router.js', 'orchestrator.js', 'model-discoverer.js',
  'icon.svg', 'README.md', 'CHANGELOG.md', 'LICENSE'
];
let copied = 0;
for (const file of filesToCopy) {
  const src = path.join(extDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(extStage, file));
    copied++;
  }
}

// Copy media folder
const mediaSrc = path.join(extDir, 'media');
if (fs.existsSync(mediaSrc)) {
  for (const mf of fs.readdirSync(mediaSrc)) {
    fs.copyFileSync(path.join(mediaSrc, mf), path.join(extStage, 'media', mf));
    copied++;
  }
}
console.log(`✅ Staged ${copied} files`);

// ── [Content_Types].xml ──
const contentTypes = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="json"         ContentType="application/json" />
  <Default Extension="js"           ContentType="application/javascript" />
  <Default Extension="md"           ContentType="text/markdown" />
  <Default Extension="svg"          ContentType="image/svg+xml" />
  <Default Extension="png"          ContentType="image/png" />
  <Default Extension="jpg"          ContentType="image/jpeg" />
  <Default Extension="vsixmanifest" ContentType="text/xml" />
</Types>`;
fs.writeFileSync(path.join(stageDir, '[Content_Types].xml'), contentTypes, 'utf8');

// ── extension.vsixmanifest ──
const cats = (packageJson.categories || ['AI']).join(',');
const vsixManifest = `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011">
  <Metadata>
    <Identity Id="${packageJson.name}" Version="${packageJson.version}" Publisher="${packageJson.publisher}" />
    <DisplayName>${packageJson.displayName}</DisplayName>
    <Description xml:space="preserve">${packageJson.description}</Description>
    <Tags>${(packageJson.keywords || []).join(',')}</Tags>
    <Categories>${cats}</Categories>
    <GalleryFlags>Public</GalleryFlags>
    <License>extension/LICENSE</License>
    <Icon>extension/media/icon.png</Icon>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code" Version="[1.80.0,)" />
  </Installation>
  <Dependencies />
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest"          Path="extension/package.json"   Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md"     Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Changelog" Path="extension/CHANGELOG.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Icons.Default"  Path="extension/media/icon.png" Addressable="true" />
  </Assets>
</PackageManifest>`;
fs.writeFileSync(path.join(stageDir, 'extension.vsixmanifest'), vsixManifest, 'utf8');

// ── Zip & output ──
try {
  if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
  const psCmd = `pwsh -NoProfile -Command "Add-Type -AssemblyName 'System.IO.Compression.FileSystem'; [System.IO.Compression.ZipFile]::CreateFromDirectory('${stageDir.replace(/\\/g,"/")}', '${outPath.replace(/\\/g,"/")}', [System.IO.Compression.CompressionLevel]::Optimal, $false)"`;
  execSync(psCmd, { stdio: 'pipe' });

  const sizeKB = Math.round(fs.statSync(outPath).size / 1024 * 10) / 10;
  console.log(`\n✅ VSIX built successfully!`);
  console.log(`   File : ${vsixName}`);
  console.log(`   Size : ${sizeKB} KB`);
  console.log(`\n🚀 Install: Extensions: Install from VSIX → select ${vsixName}\n`);
} catch (e) {
  console.error('❌ Build error:', e.message);
  process.exit(1);
} finally {
  if (fs.existsSync(stageDir)) fs.rmSync(stageDir, { recursive: true, force: true });
}
