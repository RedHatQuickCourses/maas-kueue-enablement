const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Progress Tracker Installation...\n');

// Get the directory where this script is located (progress-tracker-setup)
const SETUP_DIR = __dirname;
const TARGET_DIR = path.join(SETUP_DIR, '..');

// File mappings: source (in setup) -> destination (in project)
const FILE_MAPPINGS = {
  // Core progress tracker files
  'supplemental-ui/js/progress-tracker.js': 'supplemental-ui/js/progress-tracker.js',
  'supplemental-ui/css/progress-tracker.css': 'supplemental-ui/css/progress-tracker.css',

  // Vendor JavaScript files
  'supplemental-ui/js/vendor/tabs.js': 'supplemental-ui/js/vendor/tabs.js',
  'supplemental-ui/js/vendor/reading-time.js': 'supplemental-ui/js/vendor/reading-time.js',

  // Vendor CSS files
  'supplemental-ui/css/vendor/tabs.css': 'supplemental-ui/css/vendor/tabs.css',
  'supplemental-ui/css/vendor/collapsible.css': 'supplemental-ui/css/vendor/collapsible.css',
  'supplemental-ui/css/vendor/reading-time.css': 'supplemental-ui/css/vendor/reading-time.css',

  // Handlebars partials
  'supplemental-ui/partials/nav-tree.hbs': 'supplemental-ui/partials/nav-tree.hbs',
  'supplemental-ui/partials/head-styles.hbs': 'supplemental-ui/partials/head-styles.hbs',
  'supplemental-ui/partials/footer-scripts.hbs': 'supplemental-ui/partials/footer-scripts.hbs',
};

/**
 * Ensure a directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Copy a file from source to destination
 */
function copyFile(srcRelative, destRelative) {
  const src = path.join(SETUP_DIR, srcRelative);
  const dest = path.join(TARGET_DIR, destRelative);

  if (!fs.existsSync(src)) {
    console.warn(`⚠️  Source file not found: ${srcRelative}`);
    return false;
  }

  // Ensure destination directory exists
  ensureDir(path.dirname(dest));

  // Copy the file
  fs.copyFileSync(src, dest);
  console.log(`✅ Copied: ${destRelative}`);
  return true;
}

/**
 * Update antora-playbook.yml to include supplemental_files
 */
function updatePlaybook() {
  const playbookPath = path.join(TARGET_DIR, 'antora-playbook.yml');

  if (!fs.existsSync(playbookPath)) {
    console.warn('⚠️  antora-playbook.yml not found. Please configure ui.supplemental_files manually.');
    return;
  }

  let content = fs.readFileSync(playbookPath, 'utf8');
  let modified = false;

  // Check if supplemental_files is already configured
  if (!content.includes('supplemental_files:')) {
    // Add supplemental_files under ui: section
    content = content.replace(/ui:/, 'ui:\n  supplemental_files: ./supplemental-ui');
    modified = true;
    console.log('✅ Added supplemental_files to antora-playbook.yml');
  } else {
    console.log('ℹ️  supplemental_files already configured in playbook');
  }

  // Alert user if site.url is missing (recommended for GitHub Pages)
  if (!content.includes('url:') && content.includes('site:')) {
    console.warn('💡 Reminder: Consider setting site.url in the playbook for GitHub Pages compatibility.');
  }

  if (modified) {
    fs.writeFileSync(playbookPath, content);
  }
}

/**
 * Main installation process
 */
function install() {
  console.log('📁 Copying progress tracker files...\n');

  let successCount = 0;
  let failCount = 0;

  // Copy all files
  Object.entries(FILE_MAPPINGS).forEach(([src, dest]) => {
    if (copyFile(src, dest)) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log(`\n📝 Updating configuration...\n`);
  updatePlaybook();

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Installation complete!`);
  console.log(`   ${successCount} files copied successfully`);
  if (failCount > 0) {
    console.log(`   ⚠️  ${failCount} files failed to copy`);
  }
  console.log('='.repeat(60));

  console.log('\n📋 Next steps:');
  console.log('   1. Rebuild your Antora site: npm run build');
  console.log('   2. Serve locally to test: npm run serve');
  console.log('   3. Navigate through pages to see progress checkmarks (✓)');
  console.log('   4. Progress is saved in browser localStorage');
  console.log('\n💡 To reset progress, run in browser console:');
  console.log('   clearCourseProgress()');
  console.log('');
}

// Run installation
try {
  install();
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
