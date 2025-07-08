// Basic test framework for Chrome extension
class ExtensionTester {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(name, fn) {
        this.tests.push({ name, fn });
    }
    
    async run() {
        console.log('Running Extension Tests...');
        
        for (const test of this.tests) {
            try {
                await test.fn();
                this.passed++;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.failed++;
                console.error(`❌ ${test.name}: ${error.message}`);
            }
        }
        
        console.log(`\nTest Results: ${this.passed} passed, ${this.failed} failed`);
    }
}

// Test cases
const tester = new ExtensionTester();

tester.test('Storage API available', async () => {
    if (!chrome.storage) {
        throw new Error('Chrome storage API not available');
    }
});

tester.test('Can save and retrieve notes', async () => {
    const testNote = 'Test note content';
    await chrome.storage.local.set({ quickNotes: testNote });
    
    const result = await chrome.storage.local.get(['quickNotes']);
    if (result.quickNotes !== testNote) {
        throw new Error('Note not saved correctly');
    }
});

// Run tests if in development mode
if (chrome.runtime.getManifest().version.includes('dev')) {
    tester.run();
}
