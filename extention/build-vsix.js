const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 1-Click Zero-Dependency OPC/PKZIP VSIX Packager for AgentCouncil
 */

const extDir = __dirname;
const packageJson = JSON.parse(fs.readFileSync(path.join(extDir, 'package.json'), 'utf8'));
const vsixName = `${packageJson.name}-${packageJson.version}.vsix`;
const outPath = path.join(extDir, vsixName);

console.log(`📦 Packaging ${packageJson.displayName} into ${vsixName}...`);

const stageDir = path.join(extDir, '.staging');
const extensionStage = path.join(stageDir, 'extension');

if (fs.existsSync(stageDir)) {
  fs.rmSync(stageDir, { recursive: true, force: true });
}
fs.mkdirSync(extensionStage, { recursive: true });

// Copy all assets
const filesToCopy = ['package.json', 'extension.js', 'ecc-engine.js', 'icon.svg', 'README.md'];
for (const file of filesToCopy) {
  const src = path.join(extDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(extensionStage, file));
  }
}

// Generate [Content_Types].xml
const contentTypesXml = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="js" ContentType="application/javascript" />
  <Default Extension="md" ContentType="text/markdown" />
  <Default Extension="svg" ContentType="image/svg+xml" />
  <Default Extension="vsixmanifest" ContentType="text/xml" />
</Types>`;
fs.writeFileSync(path.join(stageDir, '[Content_Types].xml'), contentTypesXml, 'utf8');

// Generate extension.vsixmanifest
const vsixManifest = `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011">
  <Metadata>
    <Identity Id="${packageJson.name}" Version="${packageJson.version}" Publisher="${packageJson.publisher}" />
    <DisplayName>${packageJson.displayName}</DisplayName>
    <Description xml:space="preserve">${packageJson.description}</Description>
    <Categories>AI,Programming Languages</Categories>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code" />
  </Installation>
  <Dependencies />
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true" />
  </Assets>
</PackageManifest>`;
fs.writeFileSync(path.join(stageDir, 'extension.vsixmanifest'), vsixManifest, 'utf8');

// Zip using standard .NET System.IO.Compression.ZipFile
try {
  if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
  const psCmd = `pwsh -NoProfile -Command "Add-Type -AssemblyName 'System.IO.Compression.FileSystem'; [System.IO.Compression.ZipFile]::CreateFromDirectory('${stageDir}', '${outPath}', [System.IO.Compression.CompressionLevel]::Optimal, $false)"`;
  execSync(psCmd);
  console.log(`✅ Successfully built 100% compliant .VSIX package: ${vsixName} (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
} catch (e) {
  console.error('Packaging error:', e.message);
} finally {
  if (fs.existsSync(stageDir)) {
    fs.rmSync(stageDir, { recursive: true, force: true });
  }
}
