const { ExifTool } = require('exiftool-vendored');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, '../client/public/images');
const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg'));

const metadata = {
  'banner-img-paragon-cs-1440px.jpg': {
    title: 'Chase Commercial Banking - Paragon Solutions',
    description: 'Chase Bank commercial banking solutions for growing businesses',
    keywords: 'Chase, commercial banking, business solutions, financial services',
    artist: 'Chase Bank',
    copyright: '© 2026 JPMorgan Chase & Co.',
  },
  'banner-on-lok-1440x810px.jpg': {
    title: 'Chase Bank - Local Business Banking',
    description: 'Chase Bank supporting local businesses with tailored banking solutions',
    keywords: 'Chase, business banking, local business, financial services',
    artist: 'Chase Bank',
    copyright: '© 2026 JPMorgan Chase & Co.',
  },
  'cb-banner-img-connect-lp-800px-square.jpg': {
    title: 'Chase Commercial Banking - Stay Connected',
    description: 'Chase Bank digital banking platform for commercial clients',
    keywords: 'Chase, digital banking, commercial banking, online banking',
    artist: 'Chase Bank',
    copyright: '© 2026 JPMorgan Chase & Co.',
  },
  'cb-banner-img-stay-connected-800x800px-square.jpg': {
    title: 'Chase Bank - Connected Banking Experience',
    description: 'Seamless digital banking experience for Chase commercial clients',
    keywords: 'Chase, digital banking, connected banking, mobile banking',
    artist: 'Chase Bank',
    copyright: '© 2026 JPMorgan Chase & Co.',
  },
  'cb-img-quick-links-cb-lp-490x870px-vertical.jpg': {
    title: 'Chase Commercial Banking - Global Reach',
    description: 'Chase Bank global commercial banking network and services',
    keywords: 'Chase, global banking, commercial banking, international',
    artist: 'Chase Bank',
    copyright: '© 2026 JPMorgan Chase & Co.',
  },
  'gecko-thumbnail_1440x810px.jpg': {
    title: 'Chase Bank - Innovation in Banking',
    description: 'Chase Bank innovative financial technology solutions',
    keywords: 'Chase, fintech, innovation, banking technology',
    artist: 'Chase Bank',
    copyright: '© 2026 JPMorgan Chase & Co.',
  },
  'guide-to-alternative-investments-what-they-are-and-how-they-work-jpma-hero.jpg': {
    title: 'Chase Bank - Investment Solutions',
    description: 'Chase Bank alternative investment solutions for commercial clients',
    keywords: 'Chase, investments, alternative investments, wealth management',
    artist: 'Chase Bank',
    copyright: '© 2026 JPMorgan Chase & Co.',
  },
};

async function updateMetadata() {
  const exiftool = new ExifTool();
  
  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const meta = metadata[file];
    
    if (!meta) {
      console.log(`No metadata defined for ${file}, skipping...`);
      continue;
    }
    
    try {
      await exiftool.write(filePath, {
        Title: meta.title,
        Description: meta.description,
        ImageDescription: meta.description,
        Keywords: meta.keywords,
        Artist: meta.artist,
        Copyright: meta.copyright,
        Software: 'Chase Bank Clone Project',
        UserComment: 'Updated for Chase Bank clone project',
      });
      console.log(`Updated metadata for ${file}`);
    } catch (error) {
      console.error(`Error updating ${file}:`, error.message);
    }
  }
  
  await exiftool.end();
  console.log('Metadata update complete!');
}

updateMetadata().catch(console.error);